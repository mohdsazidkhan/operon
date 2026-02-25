import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Attendance from '@/models/Attendance';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const dateStr = searchParams.get('date');
        const date = dateStr ? new Date(dateStr) : new Date();
        date.setHours(0, 0, 0, 0);

        await dbConnect();
        const summary = await Attendance.aggregate([
            { $match: { organization: user.organization, date } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        return NextResponse.json({ success: true, data: summary });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
