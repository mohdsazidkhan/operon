import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Invoice from '@/models/Invoice';
import { verifyAuth } from '@/lib/auth';

export async function GET(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        await dbConnect();
        const invoice = await Invoice.findById(id).populate('createdBy', 'name email').populate('client', 'name email address');
        if (!invoice) return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: invoice });
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
        const invoice = await Invoice.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!invoice) return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: invoice });
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
        const invoice = await Invoice.findByIdAndDelete(id);
        if (!invoice) return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });

        return NextResponse.json({ success: true, message: 'Invoice deleted' });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
