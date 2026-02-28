import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CreditNote from '@/models/CreditNote';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const filter = {};
        if (status && status !== 'all') filter.status = status;
        if (search) filter.$or = [{ creditNoteNumber: { $regex: search, $options: 'i' } }];
        const [notes, total] = await Promise.all([
            CreditNote.find(filter).populate('customer', 'name email').populate('invoice', 'invoiceNumber').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            CreditNote.countDocuments(filter)
        ]);
        return NextResponse.json({ success: true, data: notes, total, page });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        if (body.items) {
            body.items = body.items.map(i => ({ ...i, total: i.quantity * i.price }));
            body.subtotal = body.items.reduce((s, i) => s + i.total, 0);
            body.total = body.subtotal + (body.tax || 0);
        }
        const cn = await CreditNote.create(body);
        return NextResponse.json({ success: true, data: cn }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }
}
