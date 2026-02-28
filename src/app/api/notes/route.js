import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Note from '@/models/Note';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const archived = searchParams.get('archived') === 'true';

        const filter = { isArchived: archived };
        if (search) filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
        ];

        const notes = await Note.find(filter).sort({ isPinned: -1, updatedAt: -1 }).lean();
        return NextResponse.json({ success: true, data: notes });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const note = await Note.create(body);
        return NextResponse.json({ success: true, data: note }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }
}
