import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Budget from '@/models/Budget';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const b = await Budget.findById(params.id).populate('approvedBy createdBy', 'name').lean();
        if (!b) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: b });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const body = await req.json();
        body.totalAllocated = (body.categories || []).reduce((s, c) => s + (c.allocated || 0), 0);
        body.totalSpent = (body.categories || []).reduce((s, c) => s + (c.spent || 0), 0);
        body.categories = (body.categories || []).map(c => ({ ...c, variance: (c.allocated || 0) - (c.spent || 0) }));
        const b = await Budget.findByIdAndUpdate(params.id, body, { new: true });
        if (!b) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: b });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        await Budget.findByIdAndDelete(params.id);
        return NextResponse.json({ success: true, message: 'Deleted' });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
