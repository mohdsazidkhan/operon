import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Lead from '@/models/Lead';
import { verifyAuth } from '@/lib/auth';

export async function GET(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        await dbConnect();
        const lead = await Lead.findById(id).populate('owner', 'name avatar email');
        if (!lead) return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: lead });
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
        const lead = await Lead.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!lead) return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: lead });
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
        const lead = await Lead.findByIdAndDelete(id);
        if (!lead) return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 });

        return NextResponse.json({ success: true, message: 'Lead deleted' });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
