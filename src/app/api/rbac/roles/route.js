import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import { verifyAuth, requirePermission, invalidateAllPermissionCaches } from '@/lib/auth';

/**
 * GET /api/rbac/roles — list all roles visible to this org
 * POST /api/rbac/roles — create a custom role
 */

export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (!requirePermission(user, 'settings.roles.view')) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();
        const Role = (await import('@/models/Role')).default;
        const { searchParams } = new URL(req.url);
        const module_ = searchParams.get('module');

        // Show global system roles + org-specific custom roles
        const query = {
            isActive: true,
            $or: [{ organization: null }, { organization: user.organization }],
        };
        if (module_) query.module = module_;

        const roles = await Role.find(query)
            .populate('createdBy', 'name email')
            .sort({ isSystem: -1, module: 1, name: 1 })
            .lean();

        return NextResponse.json({ success: true, data: roles, total: roles.length });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (!requirePermission(user, 'settings.roles.manage')) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();
        const Role = (await import('@/models/Role')).default;
        const body = await req.json();

        if (!body.name || !body.module) {
            return NextResponse.json({ success: false, message: 'name and module are required' }, { status: 400 });
        }

        const slug = body.slug || body.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

        // Custom roles are always org-scoped (not system)
        const role = await Role.create({
            name: body.name,
            slug,
            description: body.description || '',
            module: body.module,
            permissions: body.permissions || [],
            inheritsFrom: body.inheritsFrom || [],
            organization: user.organization, // scoped to this org
            isSystem: false,
            isActive: true,
            createdBy: user._id,
        });

        // Audit
        try {
            const AuditLog = (await import('@/models/AuditLog')).default;
            await AuditLog.create({
                user: user._id, action: 'role_created', module: 'settings',
                resourceId: role._id,
                details: { roleName: role.name, permissions: role.permissions },
                organization: user.organization,
            });
        } catch { /* non-fatal */ }

        return NextResponse.json({ success: true, data: role }, { status: 201 });
    } catch (err) {
        if (err.code === 11000) {
            return NextResponse.json({ success: false, message: 'A role with this name already exists' }, { status: 409 });
        }
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
