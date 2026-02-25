import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Task from '@/models/Task';
import { verifyAuth } from '@/lib/auth';

export async function GET(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        await dbConnect();
        const task = await Task.findById(id)
            .populate('assignee', 'name avatar email')
            .populate('createdBy', 'name avatar');
        if (!task) return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: task });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        const body = await req.json();
        await dbConnect();
        const task = await Task.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!task) return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: task });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        await dbConnect();
        const task = await Task.findByIdAndDelete(id);
        if (!task) return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });

        return NextResponse.json({ success: true, message: 'Task deleted' });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
