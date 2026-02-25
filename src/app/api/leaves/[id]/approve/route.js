import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Leave from '@/models/Leave';
import { verifyAuth } from '@/lib/auth';

export async function POST(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        await dbConnect();
        const leave = await Leave.findOneAndUpdate(
            { _id: id, organization: user.organization },
            { status: 'approved', approvedBy: user._id, approvedAt: new Date() },
            { new: true }
        ).populate('employee', 'name avatar');

        if (!leave) return NextResponse.json({ success: false, message: 'Leave not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: leave });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
