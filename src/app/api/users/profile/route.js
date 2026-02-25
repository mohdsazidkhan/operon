import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';

export async function PUT(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { name, phone, department, position, avatar } = body;

        await dbConnect();
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { name, phone, department, position, avatar },
            { new: true, runValidators: true }
        );

        return NextResponse.json({ success: true, data: updatedUser });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
