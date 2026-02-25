import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import Payroll from '@/models/Payroll';
import Employee from '@/models/Employee';
import { verifyAuth } from '@/lib/auth';

export async function POST(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { period, payDate } = await req.json();

        await dbConnect();
        const employees = await Employee.find({ organization: user.organization, status: 'active' });

        const existing = await Payroll.findOne({ organization: user.organization, period });
        if (existing) {
            return NextResponse.json({ success: false, message: `Payroll for ${period} already exists` }, { status: 400 });
        }

        const payrolls = await Payroll.insertMany(employees.map(emp => {
            const allowances = Math.round(emp.salary * 0.15);
            const deductions = Math.round(emp.salary * 0.12);
            return {
                employee: emp._id,
                period,
                payDate: new Date(payDate),
                basicSalary: emp.salary,
                allowances: { other: allowances },
                deductions: { other: deductions },
                netPay: emp.salary + allowances - deductions,
                processedBy: user._id,
                status: 'processed',
                organization: user.organization
            };
        }));

        return NextResponse.json({ success: true, data: payrolls, count: payrolls.length }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
