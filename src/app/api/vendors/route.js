import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Vendor from '@/models/Vendor';

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
            { code: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { contactPerson: { $regex: search, $options: 'i' } },
        ];

        const [vendors, total] = await Promise.all([
            Vendor.find(filter).sort({ name: 1 }).skip((page - 1) * limit).limit(limit).lean(),
            Vendor.countDocuments(filter)
        ]);
        return NextResponse.json({ success: true, data: vendors, total, page });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const vendor = await Vendor.create(body);
        return NextResponse.json({ success: true, data: vendor }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }
}
