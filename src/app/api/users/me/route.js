import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        return NextResponse.json({ success: true, data: user });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
