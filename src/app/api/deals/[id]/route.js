import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Deal from '@/models/Deal';
import { verifyAuth } from '@/lib/auth';

export async function GET(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        await dbConnect();
        const deal = await Deal.findById(id)
            .populate('assignedTo', 'name avatar email')
            .populate('lead', 'name email company phone')
            .populate('company', 'name')
            .populate('products.product', 'name price');
        if (!deal) return NextResponse.json({ success: false, message: 'Deal not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: deal });
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
        const deal = await Deal.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!deal) return NextResponse.json({ success: false, message: 'Deal not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: deal });
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
        const deal = await Deal.findByIdAndDelete(id);
        if (!deal) return NextResponse.json({ success: false, message: 'Deal not found' }, { status: 404 });

        return NextResponse.json({ success: true, message: 'Deal deleted' });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
