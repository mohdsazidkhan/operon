import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Contact from '@/models/Contact';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const companyId = searchParams.get('company');
        const ownerId = searchParams.get('owner');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        await dbConnect();
        const query = { organization: user.organization };
        if (companyId) query.company = companyId;
        if (ownerId) query.owner = ownerId;
        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') },
            ];
        }

        const total = await Contact.countDocuments(query);
        const contacts = await Contact.find(query)
            .populate('owner', 'name avatar')
            .populate('company', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return NextResponse.json({ success: true, data: contacts, total, page, pages: Math.ceil(total / limit) });
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
        const contact = await Contact.create({
            ...body,
            owner: user._id,
            organization: user.organization
        });

        return NextResponse.json({ success: true, data: contact }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
