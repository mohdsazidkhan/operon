import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Performance from '@/models/Performance';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const review = await Performance.findById(params.id)
            .populate('employee', 'name avatar position department')
            .populate('reviewer', 'name').lean();
        if (!review) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: review });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const body = await req.json();
        if (body.ratings) {
            const vals = Object.values(body.ratings).filter(v => v);
            body.overallScore = vals.length ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : 3;
        }
        const review = await Performance.findByIdAndUpdate(params.id, body, { new: true });
        if (!review) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: review });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        await Performance.findByIdAndDelete(params.id);
        return NextResponse.json({ success: true, message: 'Deleted' });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
