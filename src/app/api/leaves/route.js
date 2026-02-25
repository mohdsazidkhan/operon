import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Leave from '@/models/Leave';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const type = searchParams.get('type');
        const employeeId = searchParams.get('employee');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        await dbConnect();
        const query = { organization: user.organization };
        if (status) query.status = status;
        if (type) query.type = type;
        if (employeeId) query.employee = employeeId;

        const total = await Leave.countDocuments(query);
        const leaves = await Leave.find(query)
            .populate('employee', 'name avatar employeeId department position')
            .populate('approvedBy', 'name avatar')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return NextResponse.json({ success: true, data: leaves, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { startDate, endDate } = body;
        const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;

        await dbConnect();
        const leave = await Leave.create({
            ...body,
            days,
            organization: user.organization
        });

        return NextResponse.json({ success: true, data: leave }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
