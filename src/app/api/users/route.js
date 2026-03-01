import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import User from '@/models/User';
import { verifyAuth, withPermission } from '@/lib/auth';

export const GET = withPermission('settings.users.view', async (req) => {
    try {
        const user = await verifyAuth(req);
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role');

        await dbConnect();
        const query = { organization: user.organization };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (role) {
            query.role = role;
        }

        const users = await User.find(query).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: users });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
});

export const POST = withPermission('settings.users.manage', async (req) => {
    try {
        const admin = await verifyAuth(req);
        const body = await req.json();

        await dbConnect();

        // Check for duplicates
        const existing = await User.findOne({ email: body.email.toLowerCase() });
        if (existing) {
            return NextResponse.json({ success: false, message: 'User with this email already exists' }, { status: 400 });
        }

        const newUser = await User.create({
            ...body,
            organization: admin.organization,
            email: body.email.toLowerCase()
        });

        // Log the action
        const { default: AuditLog } = await import('@/models/AuditLog');
        await AuditLog.create({
            user: admin._id,
            action: 'create',
            module: 'users',
            resourceId: newUser._id,
            details: { name: newUser.name, email: newUser.email, role: newUser.role },
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
            organization: admin.organization
        });

        return NextResponse.json({ success: true, data: newUser });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }
});
