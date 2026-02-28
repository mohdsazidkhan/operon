import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db/dbConnect';
import { WILDCARD_PERMISSION } from '@/lib/permissions';
// Pre-import RBAC models so Mongoose registers their schemas before any
// .populate('role') call inside loadPermissions().
import '@/models/Permission';
import '@/models/Role';
import '@/models/UserRole';
import UserModel from '@/models/User';

// ─── In-process permission cache (5-minute TTL) ────────────────────────────
// Avoids a DB round-trip on every API request for the same user.
// Cache is automatically invalidated by timeout or explicit invalidation on
// role/permission changes.
const _permCache = new Map(); // key: userId string → { permissions: Set, exp: number }
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function invalidatePermissionCache(userId) {
    _permCache.delete(String(userId));
}

export function invalidateAllPermissionCaches() {
    _permCache.clear();
}

// ─── Load permissions for a user from UserRole + direct overrides ──────────
async function loadPermissions(userId, organizationId) {
    const cacheKey = String(userId);
    const cached = _permCache.get(cacheKey);
    if (cached && cached.exp > Date.now()) {
        return cached.permissions;
    }

    // Use top-level imports (registered at module init via eager static imports)
    const { default: UserRole } = await import('@/models/UserRole');
    // Role MUST be already registered before this populate call
    // (guaranteed by top-level `import '@/models/Role'` at the top of this file)

    const user = await UserModel.findById(userId).lean();
    if (!user) return new Set();

    // super_admin legacy check — gets wildcard
    if (user.role === 'super_admin') {
        const perm = new Set([WILDCARD_PERMISSION]);
        _permCache.set(cacheKey, { permissions: perm, exp: Date.now() + CACHE_TTL_MS });
        return perm;
    }

    const now = new Date();

    // Load all active, non-expired UserRole entries
    const assignments = await UserRole.find({
        user: userId,
        organization: organizationId,
        isActive: true,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    }).populate('role', 'permissions slug').lean();

    const merged = new Set();

    // If no RBAC assignments exist yet, fall back to legacy role mapping
    if (assignments.length === 0) {
        const legacyPerms = getLegacyPermissions(user.role);
        for (const p of legacyPerms) merged.add(p);
    } else {
        for (const assignment of assignments) {
            if (!assignment.role) continue;

            // Add role permissions (wildcard check)
            for (const perm of (assignment.role.permissions || [])) {
                merged.add(perm);
            }

            // Add per-assignment additional permissions
            for (const perm of (assignment.additionalPermissions || [])) {
                merged.add(perm);
            }

            // Remove per-assignment revoked permissions
            for (const revoked of (assignment.revokedPermissions || [])) {
                merged.delete(revoked);
            }
        }

        // Add any direct user-level permission overrides
        for (const perm of (user.directPermissions || [])) {
            merged.add(perm);
        }
    }

    _permCache.set(cacheKey, { permissions: merged, exp: Date.now() + CACHE_TTL_MS });
    return merged;
}

// ─── Legacy fallback permission sets (for users without RBAC assignments) ───
function getLegacyPermissions(role) {
    const base = ['dashboard.view'];
    switch (role) {
        case 'super_admin':
            return [WILDCARD_PERMISSION];
        case 'admin':
            return [...base, 'settings.users.view', 'settings.users.manage',
                'settings.roles.view', 'settings.roles.manage',
                'settings.organization.view', 'settings.organization.manage',
                'settings.audit-logs.view',
                'crm.leads.view', 'crm.leads.create', 'crm.leads.edit', 'crm.leads.delete', 'crm.leads.assign',
                'crm.contacts.view', 'crm.contacts.create', 'crm.contacts.edit', 'crm.contacts.delete',
                'crm.deals.view', 'crm.deals.create', 'crm.deals.edit', 'crm.deals.approve',
                'crm.companies.view', 'crm.companies.create', 'crm.reports.view',
                'hrms.employees.view', 'hrms.employees.create', 'hrms.employees.edit',
                'hrms.departments.view', 'hrms.departments.manage',
                'hrms.attendance.view', 'hrms.attendance.manage',
                'hrms.leaves.view', 'hrms.leaves.approve',
                'hrms.payroll.view', 'hrms.payroll.process',
                'hrms.recruitment.view', 'hrms.recruitment.manage',
                'hrms.performance.view', 'hrms.performance.manage',
                'erp.inventory.view', 'erp.inventory.manage',
                'erp.orders.view', 'erp.orders.create', 'erp.orders.process',
                'erp.invoices.view', 'erp.invoices.create', 'erp.invoices.approve',
                'erp.vendors.view', 'erp.vendors.manage',
                'erp.budget.view', 'erp.budget.manage',
                'erp.finance.view', 'erp.finance.report',
                'apps.projects.view', 'apps.projects.manage',
                'apps.tasks.view', 'apps.tasks.manage',
                'apps.announcements.view', 'apps.announcements.manage',
            ];
        case 'manager':
            return [...base,
                'crm.leads.view', 'crm.leads.create', 'crm.leads.edit', 'crm.leads.assign',
                'crm.contacts.view', 'crm.contacts.create',
                'crm.deals.view', 'crm.deals.create', 'crm.deals.edit',
                'crm.companies.view',
                'hrms.employees.view', 'hrms.attendance.view', 'hrms.attendance.manage',
                'hrms.leaves.view', 'hrms.leaves.approve',
                'hrms.performance.view',
                'erp.orders.view', 'erp.inventory.view',
                'erp.invoices.view', 'erp.vendors.view',
                'apps.projects.view', 'apps.tasks.view', 'apps.tasks.manage',
                'apps.announcements.view',
                'settings.users.view',
            ];
        case 'employee':
        default:
            return [...base,
                'hrms.attendance.view',
                'hrms.leaves.view', 'hrms.leaves.apply',
                'hrms.payroll.view',
                'apps.tasks.view', 'apps.tasks.manage',
                'apps.notes.view', 'apps.notes.manage',
                'apps.announcements.view',
            ];
    }
}

// ─── Core: verifyAuth ───────────────────────────────────────────────────────
/**
 * Verifies JWT + loads user from DB + loads permissions.
 * Returns the User document with `_permissions` (Set<string>) attached.
 * Returns null if unauthenticated.
 *
 * BACKWARD COMPATIBLE: existing code doing `const user = await verifyAuth(req); if (!user) ...`
 * continues to work unchanged. New code can additionally check user._permissions.
 */
export async function verifyAuth(req) {
    try {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : req.cookies.get('token')?.value;

        if (!token) return null;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await dbConnect();

        // Use statically imported UserModel (registered at module load)
        const user = await UserModel.findById(decoded.id);
        if (!user || !user.isActive) return null;

        // Load + cache permissions
        const permissions = await loadPermissions(user._id, user.organization);

        // Attach permissions as a non-enumerable property (won't appear in JSON.stringify)
        Object.defineProperty(user, '_permissions', {
            value: permissions,
            writable: true,
            enumerable: false,
            configurable: true,
        });

        // Also store as plain array for JWT refresh (enumerable)
        user._permissionsArray = [...permissions];

        return user;
    } catch {
        return null;
    }
}

// ─── Permission check helpers ───────────────────────────────────────────────

/**
 * Check if a user has a specific permission.
 * Supports wildcard (*) for super_admin.
 */
export function requirePermission(user, key) {
    if (!user || !user._permissions) return false;
    if (user._permissions.has(WILDCARD_PERMISSION)) return true;
    return user._permissions.has(key);
}

/**
 * Check if user has at least one of the given permissions.
 */
export function requireAnyPermission(user, keys) {
    return keys.some(k => requirePermission(user, k));
}

/**
 * Check if user has all of the given permissions.
 */
export function requireAllPermissions(user, keys) {
    return keys.every(k => requirePermission(user, k));
}

/**
 * Higher-order function to wrap a Next.js route handler with a permission check.
 * Automatically logs unauthorized attempts to AuditLog.
 *
 * Usage:
 *   export const GET = withPermission('crm.leads.view', async (req, ctx) => { ... });
 */
export function withPermission(permKey, handler) {
    return async (req, ctx) => {
        const { NextResponse } = await import('next/server');
        const user = await verifyAuth(req);

        if (!user) {
            return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
        }

        if (!requirePermission(user, permKey)) {
            // Log the denial
            try {
                await dbConnect();
                const { default: AuditLog } = await import('@/models/AuditLog');
                await AuditLog.create({
                    user: user._id,
                    action: 'permission_denied',
                    module: permKey.split('.')[0],
                    details: { requiredPermission: permKey, url: req.url, method: req.method },
                    ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
                    organization: user.organization,
                });
            } catch { /* non-fatal */ }

            return NextResponse.json({
                success: false,
                message: 'You do not have permission to perform this action',
                requiredPermission: permKey,
            }, { status: 403 });
        }

        return handler(req, ctx);
    };
}
