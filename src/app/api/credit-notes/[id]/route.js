import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CreditNote from '@/models/CreditNote';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const cn = await CreditNote.findById(params.id).populate('customer', 'name email phone').populate('invoice', 'invoiceNumber total').lean();
        if (!cn) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: cn });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const body = await req.json();
        if (body.items) {
            body.items = body.items.map(i => ({ ...i, total: i.quantity * i.price }));
            body.subtotal = body.items.reduce((s, i) => s + i.total, 0);
            body.total = body.subtotal + (body.tax || 0);
        }
        const cn = await CreditNote.findByIdAndUpdate(params.id, body, { new: true });
        if (!cn) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: cn });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        await CreditNote.findByIdAndDelete(params.id);
        return NextResponse.json({ success: true, message: 'Deleted' });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
