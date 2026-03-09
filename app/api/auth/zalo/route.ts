import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { zaloId, name, avatar, phone } = body;

        if (!zaloId || !name) {
            return NextResponse.json({ error: 'Missing required Zalo profile data' }, { status: 400 });
        }

        await dbConnect();

        // Upsert user based on Zalo ID
        let user = await User.findOne({ zaloId });
        if (!user) {
            user = await User.create({ zaloId, name, avatar, phone });
        } else {
            user.name = name;
            user.avatar = avatar;
            if (phone) user.phone = phone;
            await user.save();
        }

        // Set a session cookie containing the MongoDB _id
        // In production, this should be a signed JWT, not plain _id
        const response = NextResponse.json({ user, message: 'Login successful' });
        response.cookies.set('muachung_session', user._id.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        });

        return response;
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to authenticate with Zalo', message: error.message },
            { status: 500 }
        );
    }
}
