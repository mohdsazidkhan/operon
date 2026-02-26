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

        // Check for Demo Credentials from .env
        const demoEmail = process.env.email;
        const demoPassword = process.env.password;
        let user;

        if (email === demoEmail && password === demoPassword) {
            // If demo credentials match, find the user in DB or use a dummy one if not exists
            user = await User.findOne({ email });
            if (!user) {
                // Create a dummy user object if not found in DB
                user = {
                    _id: '000000000000000000000000', // Mock ObjectId
                    name: 'Demo Administrator',
                    email: demoEmail,
                    role: 'super_admin',
                    avatar: '',
                    isDemo: true // Flag to identify demo session
                };
            }
        } else {
            user = await User.findOne({ email }).select('+password');
            if (!user || !(await user.matchPassword(password))) {
                return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
            }
        }

        if (user.save) {
            user.lastLogin = Date.now();
            await user.save({ validateBeforeSave: false });
        }

        const token = generateToken(user._id);

        const response = NextResponse.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
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
