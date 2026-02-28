import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Project from '@/models/Project';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const filter = {};
        if (status && status !== 'all') filter.status = status;
        if (search) filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { client: { $regex: search, $options: 'i' } },
        ];

        const [projects, total] = await Promise.all([
            Project.find(filter)
                .populate('owner', 'name avatar')
                .populate('team', 'name avatar position')
                .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            Project.countDocuments(filter)
        ]);
        return NextResponse.json({ success: true, data: projects, total, page });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const project = await Project.create(body);
        return NextResponse.json({ success: true, data: project }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }
}
