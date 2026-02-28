import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Leave from '@/models/Leave';
import { verifyAuth } from '@/lib/auth';

export async function GET(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        await dbConnect();
        const leave = await Leave.findOne({ _id: id, organization: user.organization })
            .populate('employee', 'name email avatar')
            .populate('approvedBy', 'name avatar');

        if (!leave) return NextResponse.json({ success: false, message: 'Leave record not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: leave });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        const body = await req.json();

        // Recalculate days if dates changed
        if (body.startDate && body.endDate) {
            body.days = Math.ceil((new Date(body.endDate) - new Date(body.startDate)) / (1000 * 60 * 60 * 24)) + 1;
        }

        await dbConnect();
        const leave = await Leave.findOneAndUpdate(
            { _id: id, organization: user.organization },
            body,
            { new: true, runValidators: true }
        );

        if (!leave) return NextResponse.json({ success: false, message: 'Leave record not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: leave });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        await dbConnect();
        const leave = await Leave.findOneAndDelete({ _id: id, organization: user.organization });

        if (!leave) return NextResponse.json({ success: false, message: 'Leave record not found' }, { status: 404 });

        return NextResponse.json({ success: true, message: 'Leave record deleted successfully' });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
