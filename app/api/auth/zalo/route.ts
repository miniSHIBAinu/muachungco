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

        console.log("\n=== 🔑 THÔNG BÁO CHO ADMIN ===");
        console.log("Zalo ID của tài khoản vừa đăng nhập là:", zaloId);
        console.log("Nếu đây là nick của bạn, hãy copy dải số trên và dán vào ADMIN_ZALO_ID trong .env.local");
        console.log("===============================\n");

        // Upsert user based on Zalo ID
        let user = await User.findOne({ zaloId });
        const isAdmin = process.env.ADMIN_ZALO_ID === zaloId;
        const role = isAdmin ? 'admin' : 'user';

        if (!user) {
            user = await User.create({ zaloId, name, avatar, phone, role });
        } else {
            user.name = name;
            user.avatar = avatar;
            if (phone) user.phone = phone;
            // Upgrade to admin if matching
            if (isAdmin && user.role !== 'admin') {
                user.role = 'admin';
            }
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
