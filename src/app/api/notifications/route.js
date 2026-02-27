import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Notification from '@/models/Notification';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const notifications = await Notification.find({ user: user._id, organization: user.organization })
            .sort({ createdAt: -1 })
            .limit(50);

        return NextResponse.json({ success: true, data: notifications });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        await Notification.updateMany(
            { user: user._id, organization: user.organization, isRead: false },
            { isRead: true }
        );

        return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
