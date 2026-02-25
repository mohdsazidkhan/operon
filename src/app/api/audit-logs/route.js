import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import AuditLog from '@/models/AuditLog';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const module = searchParams.get('module');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 50;

        await dbConnect();
        const query = { organization: user.organization };
        if (module) query.module = module;

        const total = await AuditLog.countDocuments(query);
        const logs = await AuditLog.find(query)
            .populate('user', 'name avatar email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return NextResponse.json({ success: true, data: logs, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
