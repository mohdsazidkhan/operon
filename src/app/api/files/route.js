import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import VaultFile from '@/models/VaultFile';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const folder = searchParams.get('folder') || 'root';
        const search = searchParams.get('search');

        await dbConnect();
        const query = { organization: user.organization, folder };
        if (search) {
            query.name = new RegExp(search, 'i');
        }

        const files = await VaultFile.find(query).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: files });
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
        const file = await VaultFile.create({
            ...body,
            owner: user._id,
            organization: user.organization
        });

        return NextResponse.json({ success: true, data: file }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
