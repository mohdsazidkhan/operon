import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Product from '@/models/Product';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const isActive = searchParams.get('isActive');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        await dbConnect();
        const query = { organization: user.organization };
        if (category) query.category = category;
        if (isActive !== null) query.isActive = isActive === 'true';
        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { sku: new RegExp(search, 'i') },
                { brand: new RegExp(search, 'i') },
            ];
        }

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return NextResponse.json({ success: true, data: products, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        await dbConnect();
        const product = await Product.create({
            ...body,
            organization: user.organization
        });

        return NextResponse.json({ success: true, data: product }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
