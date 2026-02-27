import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Invoice from '@/models/Invoice';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        await dbConnect();
        const query = { organization: user.organization };
        if (status) query.status = status;

        const total = await Invoice.countDocuments(query);
        const invoices = await Invoice.find(query)
            .populate('customer', 'name email')
            .populate('company', 'name')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return NextResponse.json({ success: true, data: invoices, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const subtotal = body.items?.reduce((s, i) => s + (i.total || 0), 0) || 0;
        const taxAmount = (subtotal * (body.taxRate || 10)) / 100;
        const total = subtotal + taxAmount - (body.discount || 0);

        await dbConnect();
        const invoice = await Invoice.create({
            ...body,
            subtotal,
            taxAmount,
            total,
            createdBy: user._id,
            organization: user.organization
        });

        return NextResponse.json({ success: true, data: invoice }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
