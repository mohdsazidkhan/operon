import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Task from '@/models/Task';
import { verifyAuth } from '@/lib/auth';

export async function PATCH(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        const { status } = await req.json();

        await dbConnect();
        const task = await Task.findByIdAndUpdate(id, { status }, { new: true });
        if (!task) return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: task });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
