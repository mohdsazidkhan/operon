import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Task from '@/models/Task';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const assignedTo = searchParams.get('assignedTo');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        await dbConnect();
        const query = { organization: user.organization };
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (assignedTo) query.assignee = assignedTo; // Controller used assignedTo param but assignee field
        if (search) {
            query.$or = [
                { title: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
            ];
        }

        const total = await Task.countDocuments(query);
        const tasks = await Task.find(query)
            .populate('assignee', 'name avatar')
            .populate('createdBy', 'name avatar')
            .sort({ dueDate: 1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return NextResponse.json({ success: true, data: tasks, total, page, pages: Math.ceil(total / limit) });
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
        const task = await Task.create({
            ...body,
            createdBy: user._id,
            organization: user.organization
        });

        return NextResponse.json({ success: true, data: task }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
