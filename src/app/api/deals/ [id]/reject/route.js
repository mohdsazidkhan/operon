import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Deal from '@/models/Deal';
import { verifyAuth } from '@/lib/auth';

export async function POST(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        await dbConnect();

        const deal = await Deal.findByIdAndUpdate(
            id,
            {
                approvalStatus: 'rejected',
                approvedBy: user._id,
                approvalDate: new Date()
            },
            { new: true }
        );

        if (!deal) return NextResponse.json({ success: false, message: 'Deal not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: deal });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
