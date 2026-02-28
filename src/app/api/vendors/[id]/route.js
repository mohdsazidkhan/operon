import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Vendor from '@/models/Vendor';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const vendor = await Vendor.findById(params.id).lean();
        if (!vendor) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: vendor });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const body = await req.json();
        const vendor = await Vendor.findByIdAndUpdate(params.id, body, { new: true });
        if (!vendor) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: vendor });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        await Vendor.findByIdAndDelete(params.id);
        return NextResponse.json({ success: true, message: 'Deleted' });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
