import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import { verifyAuth, requirePermission, invalidateAllPermissionCaches } from '@/lib/auth';

/**
 * GET  /api/rbac/roles/[id]    — get single role
 * PUT  /api/rbac/roles/[id]    — update role permissions/name
 * DELETE /api/rbac/roles/[id]  — soft-delete role (sets isActive=false)
 * POST /api/rbac/roles/[id]?action=clone — clone role
 */

export async function GET(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (!requirePermission(user, 'settings.roles.view')) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();
        const Role = (await import('@/models/Role')).default;
        const UserRole = (await import('@/models/UserRole')).default;

        const role = await Role.findById(params.id).populate('createdBy', 'name email').lean();
        if (!role) return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });

        // Count how many users have this role in this org
        const userCount = await UserRole.countDocuments({ role: params.id, organization: user.organization, isActive: true });

        return NextResponse.json({ success: true, data: { ...role, userCount } });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (!requirePermission(user, 'settings.roles.manage')) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();
        const Role = (await import('@/models/Role')).default;
        const body = await req.json();

        const role = await Role.findById(params.id);
        if (!role) return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });

        // System roles: only super_admin can edit; others can only edit org-specific custom roles
        if (role.isSystem && user.role !== 'super_admin') {
            return NextResponse.json({ success: false, message: 'System roles can only be modified by Super Admin' }, { status: 403 });
        }

        // Only allow editing roles that belong to this org (or global system roles for super_admin)
        if (role.organization && String(role.organization) !== String(user.organization)) {
            return NextResponse.json({ success: false, message: 'Cannot edit roles from another organization' }, { status: 403 });
        }

        const allowedFields = ['name', 'description', 'permissions', 'inheritsFrom', 'isActive'];
        for (const field of allowedFields) {
            if (body[field] !== undefined) role[field] = body[field];
        }

        await role.save();

        // Invalidate ALL permission caches when a role changes (affects all users with this role)
        invalidateAllPermissionCaches();

        // Audit
        try {
            const AuditLog = (await import('@/models/AuditLog')).default;
            await AuditLog.create({
                user: user._id, action: 'role_updated', module: 'settings',
                resourceId: role._id,
                details: { roleName: role.name, changes: body },
                organization: user.organization,
            });
        } catch { /* non-fatal */ }

        return NextResponse.json({ success: true, data: role });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (!requirePermission(user, 'settings.roles.manage')) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();
        const Role = (await import('@/models/Role')).default;

        const role = await Role.findById(params.id);
        if (!role) return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
        if (role.isSystem) {
            return NextResponse.json({ success: false, message: 'System roles cannot be deleted' }, { status: 403 });
        }
        if (role.organization && String(role.organization) !== String(user.organization)) {
            return NextResponse.json({ success: false, message: 'Cannot delete roles from another organization' }, { status: 403 });
        }

        // Soft delete
        role.isActive = false;
        await role.save();

        invalidateAllPermissionCaches();

        try {
            const AuditLog = (await import('@/models/AuditLog')).default;
            await AuditLog.create({
                user: user._id, action: 'role_deleted', module: 'settings',
                resourceId: role._id,
                details: { roleName: role.name },
                organization: user.organization,
            });
        } catch { /* non-fatal */ }

        return NextResponse.json({ success: true, message: 'Role deactivated' });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

// Clone role
export async function POST(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (!requirePermission(user, 'settings.roles.manage')) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();
        const Role = (await import('@/models/Role')).default;
        const source = await Role.findById(params.id).lean();
        if (!source) return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });

        const body = await req.json().catch(() => ({}));
        const newName = body.name || `${source.name} (Copy)`;
        const newSlug = (body.slug || `${source.slug}_copy_${Date.now()}`).toLowerCase();

        const cloned = await Role.create({
            name: newName,
            slug: newSlug,
            description: body.description || `Cloned from: ${source.name}`,
            module: source.module,
            permissions: [...source.permissions],
            organization: user.organization, // always org-scoped clone
            isSystem: false,
            isActive: true,
            createdBy: user._id,
        });

        try {
            const AuditLog = (await import('@/models/AuditLog')).default;
            await AuditLog.create({
                user: user._id, action: 'role_cloned', module: 'settings',
                resourceId: cloned._id,
                details: { sourceRole: source.name, newRole: cloned.name },
                organization: user.organization,
            });
        } catch { /* non-fatal */ }

        return NextResponse.json({ success: true, data: cloned }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
