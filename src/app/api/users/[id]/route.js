import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import User from '@/models/User';
import { verifyAuth, withPermission } from '@/lib/auth';

export const PUT = withPermission('settings.users.manage', async (req, { params }) => {
    try {
        const admin = await verifyAuth(req);
        const body = await req.json();

        await dbConnect();

        const userToUpdate = await User.findOne({ _id: params.id, organization: admin.organization });
        if (!userToUpdate) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // Prevent self-demotion or deactivation
        if (userToUpdate._id.toString() === admin._id.toString()) {
            if (body.isActive === false) {
                return NextResponse.json({ success: false, message: 'You cannot deactivate your own account' }, { status: 400 });
            }
        }

        Object.assign(userToUpdate, body);
        await userToUpdate.save();

        // Log the action
        const { default: AuditLog } = await import('@/models/AuditLog');
        await AuditLog.create({
            user: admin._id,
            action: 'update',
            module: 'users',
            resourceId: userToUpdate._id,
            details: { name: userToUpdate.name, email: userToUpdate.email, updates: Object.keys(body) },
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
            organization: admin.organization
        });

        return NextResponse.json({ success: true, data: userToUpdate });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }
});
