import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });

export async function POST(req) {
    try {
        await dbConnect();
        const { name, email, password, role } = await req.json();

        const existing = await User.findOne({ email });
        if (existing) {
            return NextResponse.json({ success: false, message: 'Email already registered' }, { status: 400 });
        }

        const user = await User.create({ name, email, password, role: role || 'employee' });
        const token = generateToken(user._id);

        return NextResponse.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        }, { status: 201 });
    } catch (err) {
        console.error('Register error:', err);
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
