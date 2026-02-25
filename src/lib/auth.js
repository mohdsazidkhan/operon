import jwt from 'jsonwebtoken';
import User from '@/models/User';
import dbConnect from '@/lib/db/dbConnect';

export async function verifyAuth(req) {
    try {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.cookies.get('token')?.value;

        if (!token) return null;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await dbConnect();
        const user = await User.findById(decoded.id);

        return user;
    } catch (error) {
        return null;
    }
}
