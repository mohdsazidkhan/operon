import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Payroll from '@/models/Payroll';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const employeeId = searchParams.get('employee');
        const period = searchParams.get('period');
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        await dbConnect();
        const query = { organization: user.organization };
        if (employeeId) query.employee = employeeId;
        if (period) query.period = period;
        if (status) query.status = status;

        const total = await Payroll.countDocuments(query);
        const payrolls = await Payroll.find(query)
            .populate('employee', 'name avatar employeeId department position salary')
            .populate('processedBy', 'name')
            .sort({ payDate: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return NextResponse.json({ success: true, data: payrolls, total, page, pages: Math.ceil(total / limit) });
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
        const payroll = await Payroll.create({
            ...body,
            organization: user.organization,
            processedBy: user._id
        });

        return NextResponse.json({ success: true, data: payroll }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
