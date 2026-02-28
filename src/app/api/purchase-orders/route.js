import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PurchaseOrder from '@/models/PurchaseOrder';

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
        if (search) filter.$or = [
            { poNumber: { $regex: search, $options: 'i' } },
            { vendorName: { $regex: search, $options: 'i' } },
        ];

        const [orders, total] = await Promise.all([
            PurchaseOrder.find(filter)
                .populate('vendor', 'name code email')
                .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            PurchaseOrder.countDocuments(filter)
        ]);
        return NextResponse.json({ success: true, data: orders, total, page });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        // Calculate item totals
        if (body.items) {
            body.items = body.items.map(item => ({ ...item, total: item.quantity * item.unitPrice }));
            body.subtotal = body.items.reduce((s, i) => s + i.total, 0);
            body.total = body.subtotal + (body.tax || 0) + (body.shipping || 0);
        }
        const po = await PurchaseOrder.create(body);
        return NextResponse.json({ success: true, data: po }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }
}
