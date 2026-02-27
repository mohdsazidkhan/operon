import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/dbConnect';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });

export async function POST(req) {
    try {
        await dbConnect();
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ success: false, message: 'Please provide email and password' }, { status: 400 });
        }

        // Find the user in DB and verify password
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
        }

        // Update last login time without triggering pre-save hook
        await User.findByIdAndUpdate(user._id, { lastLogin: Date.now() });

        const token = generateToken(user._id);

        const response = NextResponse.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organization: user.organization,
                department: user.department,
                position: user.position,
                avatar: user.avatar,
            },
            token
        });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 86400,
            path: '/',
        });

        return response;
    } catch (err) {
        console.error('Login error:', err);
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
