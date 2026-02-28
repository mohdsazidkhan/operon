import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Department from '@/models/Department';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const filter = search ? { name: { $regex: search, $options: 'i' } } : {};
        const departments = await Department.find(filter)
            .populate('manager', 'name avatar position')
            .sort({ name: 1 }).lean();
        return NextResponse.json({ success: true, data: departments });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const dept = await Department.create(body);
        return NextResponse.json({ success: true, data: dept }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }
}
