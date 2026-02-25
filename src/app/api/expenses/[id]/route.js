import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Expense from '@/models/Expense';
import { verifyAuth } from '@/lib/auth';

export async function GET(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        await dbConnect();
        const expense = await Expense.findById(id).populate('submittedBy', 'name email').populate('approvedBy', 'name');
        if (!expense) return NextResponse.json({ success: false, message: 'Expense not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: expense });
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
        const expense = await Expense.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!expense) return NextResponse.json({ success: false, message: 'Expense not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: expense });
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
        const expense = await Expense.findByIdAndDelete(id);
        if (!expense) return NextResponse.json({ success: false, message: 'Expense not found' }, { status: 404 });

        return NextResponse.json({ success: true, message: 'Expense deleted' });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
