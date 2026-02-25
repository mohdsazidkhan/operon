import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Company from '@/models/Company';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const industry = searchParams.get('industry');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        await dbConnect();
        const query = { organization: user.organization };
        if (industry) query.industry = industry;
        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { website: new RegExp(search, 'i') },
            ];
        }

        const total = await Company.countDocuments(query);
        const companies = await Company.find(query)
            .populate('owner', 'name avatar')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return NextResponse.json({ success: true, data: companies, total, page, pages: Math.ceil(total / limit) });
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
        const company = await Company.create({
            ...body,
            owner: user._id,
            organization: user.organization
        });

        return NextResponse.json({ success: true, data: company }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
