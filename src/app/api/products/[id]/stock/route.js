import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Product from '@/models/Product';
import { verifyAuth } from '@/lib/auth';

export async function PATCH(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        const { quantity, type } = await req.json(); // type: 'add' | 'subtract' | 'set'

        await dbConnect();
        const product = await Product.findById(id);
        if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });

        if (type === 'set') product.stock = quantity;
        else if (type === 'subtract') product.stock = Math.max(0, product.stock - quantity);
        else product.stock += (quantity || 0); // add

        await product.save();
        return NextResponse.json({ success: true, data: product });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
