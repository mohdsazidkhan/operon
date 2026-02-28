import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Recruitment from '@/models/Recruitment';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const job = await Recruitment.findById(params.id).lean();
        if (!job) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: job });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const body = await req.json();
        const job = await Recruitment.findByIdAndUpdate(params.id, body, { new: true });
        if (!job) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: job });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        await Recruitment.findByIdAndDelete(params.id);
        return NextResponse.json({ success: true, message: 'Deleted' });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
