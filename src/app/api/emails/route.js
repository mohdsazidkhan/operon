import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Email from '@/models/Email';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const folder = searchParams.get('folder') || 'inbox';
        const search = searchParams.get('search');

        await dbConnect();
        const query = { organization: user.organization, folder };
        if (search) {
            query.$or = [
                { subject: new RegExp(search, 'i') },
                { content: new RegExp(search, 'i') },
                { 'sender.name': new RegExp(search, 'i') },
                { 'sender.email': new RegExp(search, 'i') },
            ];
        }

        const emails = await Email.find(query).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: emails });
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
        const email = await Email.create({
            ...body,
            organization: user.organization
        });

        return NextResponse.json({ success: true, data: email }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
