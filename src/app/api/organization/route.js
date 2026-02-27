import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Organization from '@/models/Organization';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const org = await Organization.findById(user.organization).populate('owner', 'name email');

        if (!org) {
            return NextResponse.json({ success: false, message: 'Organization not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: org });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const body = await req.json();

        await dbConnect();
        const org = await Organization.findOneAndUpdate(
            { _id: user.organization },
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!org) {
            return NextResponse.json({ success: false, message: 'Organization not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: org });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
