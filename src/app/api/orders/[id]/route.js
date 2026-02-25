import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Order from '@/models/Order';
import { verifyAuth } from '@/lib/auth';

export async function GET(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        await dbConnect();
        const order = await Order.findById(id)
            .populate('vendor', 'name email phone address')
            .populate('customer', 'name email phone address')
            .populate('items.product', 'name sku price')
            .populate('createdBy', 'name avatar');
        if (!order) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: order });
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
        const order = await Order.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!order) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: order });
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
        const order = await Order.findByIdAndDelete(id);
        if (!order) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });

        return NextResponse.json({ success: true, message: 'Order deleted' });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
