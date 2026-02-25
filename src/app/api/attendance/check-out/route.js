import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Attendance from '@/models/Attendance';
import { verifyAuth } from '@/lib/auth';

export async function POST(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { employeeId } = await req.json();
        const today = new Date(); today.setHours(0, 0, 0, 0);

        await dbConnect();
        const record = await Attendance.findOne({ organization: user.organization, employee: employeeId, date: today });
        if (!record) {
            return NextResponse.json({ success: false, message: 'No check-in found for today' }, { status: 404 });
        }

        record.checkOut = new Date();
        const diff = (record.checkOut - record.checkIn) / 3600000;
        record.hoursWorked = Math.round(diff * 10) / 10;
        await record.save();

        return NextResponse.json({ success: true, data: record });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
