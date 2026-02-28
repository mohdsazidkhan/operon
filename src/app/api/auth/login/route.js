import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import jwt from 'jsonwebtoken';
import { WILDCARD_PERMISSION } from '@/lib/permissions';
// ↓ Import all RBAC models at the top so Mongoose registers their schemas
//   BEFORE any .populate('role') call is made during login.
import '@/models/Permission';
import '@/models/Role';
import '@/models/UserRole';
import User from '@/models/User';

// ─── Permission loader (mirrors auth.js logic but for login context) ─────────
async function loadPermissionsForLogin(user) {
    if (user.role === 'super_admin') return [WILDCARD_PERMISSION];

    const UserRole = (await import('@/models/UserRole')).default;
    const now = new Date();

    const assignments = await UserRole.find({
        user: user._id,
        organization: user.organization,
        isActive: true,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    }).populate('role', 'permissions').lean();

    if (assignments.length === 0) {
        // Return legacy defaults (same as auth.js getLegacyPermissions)
        return getLegacyFallback(user.role);
    }

    const merged = new Set();
    for (const a of assignments) {
        for (const p of (a.role?.permissions || [])) merged.add(p);
        for (const p of (a.additionalPermissions || [])) merged.add(p);
        for (const r of (a.revokedPermissions || [])) merged.delete(r);
    }
    for (const p of (user.directPermissions || [])) merged.add(p);
    return [...merged];
}

function getLegacyFallback(role) {
    const base = ['dashboard.view'];
    if (role === 'admin') return [...base,
        'settings.users.view', 'settings.users.manage', 'settings.roles.view', 'settings.roles.manage',
        'settings.organization.view', 'settings.organization.manage', 'settings.audit-logs.view',
        'crm.leads.view', 'crm.leads.create', 'crm.leads.edit', 'crm.leads.delete',
        'crm.contacts.view', 'crm.contacts.create', 'crm.contacts.edit',
        'crm.deals.view', 'crm.deals.create', 'crm.deals.edit', 'crm.deals.approve',
        'crm.companies.view', 'crm.reports.view',
        'hrms.employees.view', 'hrms.employees.create', 'hrms.employees.edit',
        'hrms.departments.view', 'hrms.departments.manage',
        'hrms.attendance.view', 'hrms.attendance.manage',
        'hrms.leaves.view', 'hrms.leaves.approve',
        'hrms.payroll.view', 'hrms.payroll.process',
        'hrms.recruitment.view', 'hrms.recruitment.manage',
        'hrms.performance.view', 'hrms.performance.manage',
        'erp.inventory.view', 'erp.inventory.manage', 'erp.orders.view', 'erp.orders.create',
        'erp.invoices.view', 'erp.invoices.create', 'erp.invoices.approve',
        'erp.vendors.view', 'erp.vendors.manage',
        'erp.budget.view', 'erp.budget.manage', 'erp.finance.view', 'erp.finance.report',
        'apps.projects.view', 'apps.projects.manage',
        'apps.tasks.view', 'apps.tasks.manage',
        'apps.announcements.view', 'apps.announcements.manage',
    ];
    if (role === 'manager') return [...base,
        'crm.leads.view', 'crm.leads.create', 'crm.leads.edit',
        'crm.contacts.view', 'crm.deals.view', 'crm.deals.create',
        'crm.companies.view',
        'hrms.employees.view', 'hrms.attendance.view', 'hrms.leaves.view', 'hrms.leaves.approve',
        'erp.orders.view', 'erp.invoices.view',
        'apps.projects.view', 'apps.tasks.view', 'apps.tasks.manage',
        'apps.announcements.view',
        'settings.users.view',
    ];
    return [...base,
        'hrms.attendance.view', 'hrms.leaves.view', 'hrms.leaves.apply', 'hrms.payroll.view',
        'apps.tasks.view', 'apps.tasks.manage', 'apps.notes.view', 'apps.notes.manage',
        'apps.announcements.view',
    ];
}

export async function POST(req) {
    try {
        await dbConnect();
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ success: false, message: 'Please provide email and password' }, { status: 400 });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
        }

        if (!user.isActive) {
            return NextResponse.json({ success: false, message: 'Account is deactivated. Contact your administrator.' }, { status: 403 });
        }

        // Update last login
        await User.findByIdAndUpdate(user._id, { lastLogin: Date.now() });

        // Load effective permissions for this session
        const permissions = await loadPermissionsForLogin(user);

        // JWT now includes permissions array for fast client-side checks
        const token = jwt.sign(
            { id: user._id, permissions },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Log successful login
        try {
            const AuditLog = (await import('@/models/AuditLog')).default;
            await AuditLog.create({
                user: user._id,
                action: 'login',
                module: 'auth',
                details: { email: user.email },
                ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
                organization: user.organization,
            });
        } catch { /* non-fatal */ }

        const response = NextResponse.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organization: user.organization,
                department: user.department,
                position: user.position,
                avatar: user.avatar,
                permissions, // ← New: array of permission keys for Zustand store
            },
            token
        });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 86400,
            path: '/',
            sameSite: 'lax',
        });

        return response;
    } catch (err) {
        console.error('Login error:', err);
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
