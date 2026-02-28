import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import { verifyAuth, requirePermission, invalidatePermissionCache } from '@/lib/auth';

/**
 * GET  /api/rbac/users/[userId]/roles  — list roles assigned to a user
 * POST /api/rbac/users/[userId]/roles  — assign a role to a user
 * DELETE /api/rbac/users/[userId]/roles — revoke a specific role assignment
 */

export async function GET(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (!requirePermission(user, 'settings.users.view')) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();
        const UserRole = (await import('@/models/UserRole')).default;

        const assignments = await UserRole.find({
            user: params.userId,
            organization: user.organization,
        })
            .populate('role', 'name slug module permissions isSystem')
            .populate('grantedBy', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, data: assignments });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (!requirePermission(user, 'settings.users.manage')) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();
        const [UserRole, Role, User] = await Promise.all([
            import('@/models/UserRole').then(m => m.default),
            import('@/models/Role').then(m => m.default),
            import('@/models/User').then(m => m.default),
        ]);

        const body = await req.json();
        const { roleId, expiresAt, branch, additionalPermissions, revokedPermissions } = body;

        if (!roleId) return NextResponse.json({ success: false, message: 'roleId is required' }, { status: 400 });

        // Verify role exists and is accessible
        const role = await Role.findById(roleId);
        if (!role || !role.isActive) {
            return NextResponse.json({ success: false, message: 'Role not found or inactive' }, { status: 404 });
        }

        // Verify target user exists in same org
        const targetUser = await User.findById(params.userId);
        if (!targetUser || String(targetUser.organization) !== String(user.organization)) {
            return NextResponse.json({ success: false, message: 'User not found in your organization' }, { status: 404 });
        }

        // Prevent privilege escalation: only super_admin can assign super_admin role
        if (role.slug === 'super_admin' && user.role !== 'super_admin') {
            return NextResponse.json({ success: false, message: 'Only Super Admin can assign the Super Admin role' }, { status: 403 });
        }

        // Upsert: if assignment already exists, reactivate it
        const assignment = await UserRole.findOneAndUpdate(
            { user: params.userId, role: roleId, organization: user.organization },
            {
                isActive: true,
                grantedBy: user._id,
                expiresAt: expiresAt || null,
                branch: branch || null,
                additionalPermissions: additionalPermissions || [],
                revokedPermissions: revokedPermissions || [],
            },
            { upsert: true, new: true }
        ).populate('role', 'name slug module');

        // Invalidate cache for target user immediately
        invalidatePermissionCache(params.userId);

        // Audit
        try {
            const AuditLog = (await import('@/models/AuditLog')).default;
            await AuditLog.create({
                user: user._id, action: 'role_assigned', module: 'settings',
                resourceId: params.userId,
                details: { targetUser: targetUser.email, role: role.name, expiresAt },
                organization: user.organization,
            });
        } catch { /* non-fatal */ }

        return NextResponse.json({ success: true, data: assignment }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (!requirePermission(user, 'settings.users.manage')) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const roleId = searchParams.get('roleId');
        if (!roleId) return NextResponse.json({ success: false, message: 'roleId query param required' }, { status: 400 });

        await dbConnect();
        const UserRole = (await import('@/models/UserRole')).default;
        const Role = (await import('@/models/Role')).default;

        const role = await Role.findById(roleId);
        // Prevent revoking super_admin from themselves unless you are super_admin
        if (role?.slug === 'super_admin' && user.role !== 'super_admin') {
            return NextResponse.json({ success: false, message: 'Only Super Admin can revoke the Super Admin role' }, { status: 403 });
        }

        await UserRole.findOneAndUpdate(
            { user: params.userId, role: roleId, organization: user.organization },
            { isActive: false }
        );

        invalidatePermissionCache(params.userId);

        try {
            const AuditLog = (await import('@/models/AuditLog')).default;
            await AuditLog.create({
                user: user._id, action: 'role_revoked', module: 'settings',
                resourceId: params.userId,
                details: { roleId, roleName: role?.name },
                organization: user.organization,
            });
        } catch { /* non-fatal */ }

        return NextResponse.json({ success: true, message: 'Role revoked' });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
