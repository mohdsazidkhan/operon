import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Deal from '@/models/Deal';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const deals = await Deal.find({ organization: user.organization })
            .populate('assignedTo', 'name avatar')
            .populate('company', 'name')
            .sort({ updatedAt: -1 });

        const pipeline = deals.reduce((acc, deal) => {
            if (!acc[deal.stage]) acc[deal.stage] = [];
            acc[deal.stage].push(deal);
            return acc;
        }, {});

        return NextResponse.json({ success: true, data: pipeline });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
