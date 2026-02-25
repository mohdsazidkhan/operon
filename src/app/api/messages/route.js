import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Message from '@/models/Message';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const channelId = searchParams.get('channelId');

        await dbConnect();
        const query = { organization: user.organization };
        if (channelId) {
            query.channelId = channelId;
        }

        const messages = await Message.find(query).populate('sender', 'name avatar').sort({ createdAt: 1 });

        return NextResponse.json({ success: true, data: messages });
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
        const message = await Message.create({
            ...body,
            sender: user._id,
            organization: user.organization
        });

        return NextResponse.json({ success: true, data: message }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
