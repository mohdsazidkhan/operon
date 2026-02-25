import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Company from '@/models/Company';
import { verifyAuth } from '@/lib/auth';

export async function GET(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        await dbConnect();
        const company = await Company.findById(id).populate('owner', 'name avatar email');
        if (!company) return NextResponse.json({ success: false, message: 'Company not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: company });
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
        const company = await Company.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!company) return NextResponse.json({ success: false, message: 'Company not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: company });
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
        const company = await Company.findByIdAndDelete(id);
        if (!company) return NextResponse.json({ success: false, message: 'Company not found' }, { status: 404 });

        return NextResponse.json({ success: true, message: 'Company deleted' });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
