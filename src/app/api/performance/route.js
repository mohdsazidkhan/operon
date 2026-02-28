import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Performance from '@/models/Performance';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const employeeId = searchParams.get('employee');
        const period = searchParams.get('period');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const filter = {};
        if (employeeId) filter.employee = employeeId;
        if (period) filter.period = period;

        const [reviews, total] = await Promise.all([
            Performance.find(filter)
                .populate('employee', 'name avatar position department')
                .populate('reviewer', 'name')
                .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            Performance.countDocuments(filter)
        ]);
        return NextResponse.json({ success: true, data: reviews, total, page });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        // Calculate overall score from ratings average
        if (body.ratings) {
            const vals = Object.values(body.ratings).filter(v => v);
            body.overallScore = vals.length ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : 3;
        }
        const review = await Performance.create(body);
        return NextResponse.json({ success: true, data: review }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }
}
