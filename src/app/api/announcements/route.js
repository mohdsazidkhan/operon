import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Announcement from '@/models/Announcement';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const [announcements, total] = await Promise.all([
            Announcement.find({})
                .sort({ isPinned: -1, createdAt: -1 })
                .skip((page - 1) * limit).limit(limit).lean(),
            Announcement.countDocuments()
        ]);
        return NextResponse.json({ success: true, data: announcements, total, page });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const announcement = await Announcement.create(body);
        return NextResponse.json({ success: true, data: announcement }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }
}
