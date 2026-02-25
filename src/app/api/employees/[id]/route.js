import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Employee from '@/models/Employee';
import { verifyAuth } from '@/lib/auth';

export async function GET(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        await dbConnect();
        const emp = await Employee.findById(id).populate('manager', 'name avatar position');
        if (!emp) return NextResponse.json({ success: false, message: 'Employee not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: emp });
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
        const emp = await Employee.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!emp) return NextResponse.json({ success: false, message: 'Employee not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: emp });
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
        await Employee.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: 'Employee deleted' });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
