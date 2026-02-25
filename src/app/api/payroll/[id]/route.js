import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Payroll from '@/models/Payroll';
import { verifyAuth } from '@/lib/auth';

export async function GET(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        await dbConnect();
        const payroll = await Payroll.findById(id)
            .populate('employee', 'name avatar employeeId department position salary')
            .populate('processedBy', 'name');
        if (!payroll) return NextResponse.json({ success: false, message: 'Payroll record not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: payroll });
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
        await dbConnect();
        const payroll = await Payroll.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!payroll) return NextResponse.json({ success: false, message: 'Payroll record not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: payroll });
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
        await Payroll.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: 'Payroll record deleted' });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
