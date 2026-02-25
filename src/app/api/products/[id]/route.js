import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Product from '@/models/Product';
import { verifyAuth } from '@/lib/auth';

export async function GET(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        await dbConnect();
        const product = await Product.findById(id);
        if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: product });
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
        const product = await Product.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: product });
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
        const product = await Product.findByIdAndDelete(id);
        if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });

        return NextResponse.json({ success: true, message: 'Product deleted' });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
