import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Department from '@/models/Department';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const dept = await Department.findById((await params).id).populate('manager', 'name avatar position').lean();
        if (!dept) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: dept });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const body = await req.json();
        const dept = await Department.findByIdAndUpdate((await params).id, body, { new: true, runValidators: true });
        if (!dept) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: dept });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        await Department.findByIdAndDelete((await params).id);
        return NextResponse.json({ success: true, message: 'Deleted' });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
