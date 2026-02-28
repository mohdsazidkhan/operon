import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Recruitment from '@/models/Recruitment';

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
            { jobTitle: { $regex: search, $options: 'i' } },
            { departmentName: { $regex: search, $options: 'i' } },
        ];

        const [jobs, total] = await Promise.all([
            Recruitment.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            Recruitment.countDocuments(filter)
        ]);
        return NextResponse.json({ success: true, data: jobs, total, page });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const job = await Recruitment.create(body);
        return NextResponse.json({ success: true, data: job }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }
}
