import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Attendance from '@/models/Attendance';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const employeeId = searchParams.get('employee');
        const status = searchParams.get('status');
        const date = searchParams.get('date');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 50;

        await dbConnect();
        const query = { organization: user.organization };
        if (employeeId) query.employee = employeeId;
        if (status) query.status = status;
        if (date) query.date = new Date(date);
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const total = await Attendance.countDocuments(query);
        const records = await Attendance.find(query)
            .populate('employee', 'name avatar employeeId department position')
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return NextResponse.json({ success: true, data: records, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        await dbConnect();
        const record = await Attendance.create({
            ...body,
            organization: user.organization
        });

        return NextResponse.json({ success: true, data: record }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
