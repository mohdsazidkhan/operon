import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Contact from '@/models/Contact';
import { verifyAuth } from '@/lib/auth';

export async function GET(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        await dbConnect();
        const contact = await Contact.findById(id)
            .populate('owner', 'name avatar email')
            .populate('company', 'name');
        if (!contact) return NextResponse.json({ success: false, message: 'Contact not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: contact });
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
        const contact = await Contact.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!contact) return NextResponse.json({ success: false, message: 'Contact not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: contact });
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
        const contact = await Contact.findByIdAndDelete(id);
        if (!contact) return NextResponse.json({ success: false, message: 'Contact not found' }, { status: 404 });

        return NextResponse.json({ success: true, message: 'Contact deleted' });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
