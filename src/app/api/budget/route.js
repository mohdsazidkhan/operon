import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Budget from '@/models/Budget';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const department = searchParams.get('department');
        const fiscalYear = searchParams.get('fiscalYear');
        const filter = {};
        if (department) filter.department = department;
        if (fiscalYear) filter.fiscalYear = fiscalYear;
        const budgets = await Budget.find(filter).populate('approvedBy', 'name').sort({ createdAt: -1 }).lean();
        return NextResponse.json({ success: true, data: budgets });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        body.totalAllocated = (body.categories || []).reduce((s, c) => s + (c.allocated || 0), 0);
        body.totalSpent = (body.categories || []).reduce((s, c) => s + (c.spent || 0), 0);
        body.categories = (body.categories || []).map(c => ({ ...c, variance: (c.allocated || 0) - (c.spent || 0) }));
        const budget = await Budget.create(body);
        return NextResponse.json({ success: true, data: budget }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }
}
