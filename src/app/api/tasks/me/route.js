import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Task from '@/models/Task';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const tasks = await Task.find({ assignee: user._id })
            .populate('createdBy', 'name avatar')
            .sort({ dueDate: 1 });

        return NextResponse.json({ success: true, data: tasks, total: tasks.length });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
