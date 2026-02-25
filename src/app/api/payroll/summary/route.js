import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Payroll from '@/models/Payroll';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period');

        await dbConnect();
        const match = { organization: user.organization };
        if (period) match.period = period;

        const summary = await Payroll.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$period',
                    totalBaseSalary: { $sum: '$basicSalary' },
                    totalNetPay: { $sum: '$netPay' },
                    headcount: { $sum: 1 },
                }
            },
            { $sort: { _id: -1 } },
        ]);

        return NextResponse.json({ success: true, data: summary });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
