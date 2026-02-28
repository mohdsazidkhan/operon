import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PurchaseOrder from '@/models/PurchaseOrder';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const po = await PurchaseOrder.findById(params.id).populate('vendor', 'name code email phone address').lean();
        if (!po) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: po });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const body = await req.json();
        if (body.items) {
            body.items = body.items.map(item => ({ ...item, total: item.quantity * item.unitPrice }));
            body.subtotal = body.items.reduce((s, i) => s + i.total, 0);
            body.total = body.subtotal + (body.tax || 0) + (body.shipping || 0);
        }
        const po = await PurchaseOrder.findByIdAndUpdate(params.id, body, { new: true });
        if (!po) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: po });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        await PurchaseOrder.findByIdAndDelete(params.id);
        return NextResponse.json({ success: true, message: 'Deleted' });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
