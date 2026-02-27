import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Deal from '@/models/Deal';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const stage = searchParams.get('stage');
        const owner = searchParams.get('owner');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        await dbConnect();
        const query = { organization: user.organization };
        if (stage) query.stage = stage;
        if (owner) query.owner = owner;
        if (search) {
            query.$or = [
                { title: new RegExp(search, 'i') },
            ];
        }

        const total = await Deal.countDocuments(query);
        const deals = await Deal.find(query)
            .populate('owner', 'name avatar')
            .populate('lead', 'name email company')
            .populate('company', 'name')
            .sort({ updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return NextResponse.json({ success: true, data: deals, total, page, pages: Math.ceil(total / limit) });
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
        const deal = await Deal.create({
            ...body,
            organization: user.organization,
            owner: body.owner || user._id,
        });

        return NextResponse.json({ success: true, data: deal }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
