import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Event from '@/models/Event';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');

        await dbConnect();
        const query = { organization: user.organization };
        if (search) {
            query.title = new RegExp(search, 'i');
        }

        const events = await Event.find(query).sort({ startDate: 1 });

        return NextResponse.json({ success: true, data: events });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        await dbConnect();
        const event = await Event.create({
            ...body,
            organization: user.organization
        });

        return NextResponse.json({ success: true, data: event }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
