import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Expense from '@/models/Expense';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        await dbConnect();
        const query = { organization: user.organization };
        if (category) query.category = category;
        if (status) query.status = status;

        const total = await Expense.countDocuments(query);
        const expenses = await Expense.find(query)
            .populate('submittedBy', 'name avatar')
            .populate('approvedBy', 'name')
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return NextResponse.json({ success: true, data: expenses, total, page, pages: Math.ceil(total / limit) });
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
        const expense = await Expense.create({
            ...body,
            organization: user.organization,
            submittedBy: user._id
        });

        return NextResponse.json({ success: true, data: expense }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
