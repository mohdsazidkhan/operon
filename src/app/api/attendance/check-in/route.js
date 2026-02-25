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
        const existing = await Attendance.findOne({ organization: user.organization, employee: employeeId, date: today });
        if (existing) {
            return NextResponse.json({ success: false, message: 'Already checked in today' }, { status: 400 });
        }

        const record = await Attendance.create({
            employee: employeeId,
            date: today,
            checkIn: new Date(),
            status: 'present',
            organization: user.organization
        });

        return NextResponse.json({ success: true, data: record }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
