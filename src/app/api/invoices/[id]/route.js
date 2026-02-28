import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Invoice from '@/models/Invoice';
import { verifyAuth } from '@/lib/auth';

export async function GET(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        await dbConnect();
        const invoice = await Invoice.findById(params.id)
            .populate('customer', 'name email phone address')
            .populate('company', 'name address')
            .populate('createdBy', 'name');
        if (!invoice) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: invoice });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        const body = await req.json();
        if (body.items) {
            const subtotal = body.items.reduce((s, i) => s + (i.total || 0), 0);
            body.subtotal = subtotal;
            body.total = subtotal + (body.tax || 0);
        }
        await dbConnect();
        const invoice = await Invoice.findByIdAndUpdate(params.id, body, { new: true })
            .populate('customer', 'name email')
            .populate('company', 'name');
        if (!invoice) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: invoice });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        await dbConnect();
        await Invoice.findByIdAndDelete(params.id);
        return NextResponse.json({ success: true, message: 'Deleted' });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
