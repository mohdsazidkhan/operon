import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import { verifyAuth, requirePermission } from '@/lib/auth';
import { PERMISSION_DEFINITIONS, SYSTEM_ROLES } from '@/lib/permissions';

/**
 * POST /api/rbac/seed
 * Idempotent — seeds system permissions and roles. Safe to re-run.
 * Requires: super_admin role or settings.roles.manage permission.
 */
export async function POST(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (!requirePermission(user, 'settings.roles.manage') && user.role !== 'super_admin') {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();
        const Permission = (await import('@/models/Permission')).default;
        const Role = (await import('@/models/Role')).default;

        const results = { permissions: { created: 0, skipped: 0 }, roles: { created: 0, updated: 0 } };

        // ── 1. Upsert all permission definitions ──────────────────────────
        for (const def of PERMISSION_DEFINITIONS) {
            const existing = await Permission.findOne({ key: def.key });
            if (!existing) {
                await Permission.create(def);
                results.permissions.created++;
            } else {
                results.permissions.skipped++;
            }
        }

        // ── 2. Upsert all system roles ─────────────────────────────────
        for (const roleDef of SYSTEM_ROLES) {
            const existing = await Role.findOne({ slug: roleDef.slug, organization: null });
            if (!existing) {
                await Role.create({ ...roleDef, organization: null, createdBy: user._id });
                results.roles.created++;
            } else {
                // Update permissions but don't overwrite custom org settings
                await Role.findByIdAndUpdate(existing._id, {
                    permissions: roleDef.permissions,
                    description: roleDef.description,
                    isSystem: true,
                });
                results.roles.updated++;
            }
        }

        // Audit log
        try {
            const AuditLog = (await import('@/models/AuditLog')).default;
            await AuditLog.create({
                user: user._id, action: 'rbac_seed', module: 'settings',
                details: results, organization: user.organization,
            });
        } catch { /* non-fatal */ }

        return NextResponse.json({ success: true, message: 'RBAC seed complete', data: results });
    } catch (err) {
        console.error('RBAC seed error:', err);
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
