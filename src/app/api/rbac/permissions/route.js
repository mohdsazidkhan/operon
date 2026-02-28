import { NextResponse } from 'next/server';
import { PERMISSION_DEFINITIONS } from '@/lib/permissions';
import { verifyAuth, requirePermission } from '@/lib/auth';
import dbConnect from '@/lib/db/dbConnect';

/**
 * GET /api/rbac/permissions
 * Returns the complete list of permission definitions.
 * Optionally filtered by ?module=crm|hrms|erp|global
 * Requires: settings.roles.view
 */
export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (!requirePermission(user, 'settings.roles.view')) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const module_ = searchParams.get('module');

        let perms = PERMISSION_DEFINITIONS;
        if (module_) perms = perms.filter(p => p.module === module_);

        // Group by module for easier consumption
        const grouped = perms.reduce((acc, p) => {
            if (!acc[p.module]) acc[p.module] = [];
            acc[p.module].push(p);
            return acc;
        }, {});

        return NextResponse.json({
            success: true,
            data: perms,
            grouped,
            total: perms.length,
        });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
