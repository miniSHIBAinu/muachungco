import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const redirectUri = `${url.origin}/api/auth/zalo/callback`;

    if (!code) {
        return NextResponse.redirect(new URL('/account?error=NoCode_ZaloLogin', url.origin));
    }

    try {
        const appId = process.env.ZALO_APP_ID;
        const secret = process.env.ZALO_SECRET;

        // Exchange code for access_token
        const tokenResponse = await fetch('https://oauth.zaloapp.com/v4/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'secret_key': secret!
            },
            body: new URLSearchParams({
                app_id: appId!,
                code,
                grant_type: 'authorization_code',
            }),
        });

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;
        if (!accessToken) throw new Error('No access token received: ' + JSON.stringify(tokenData));

        // Get user info using access_token
        const userResponse = await fetch('https://graph.zalo.me/v2.0/me?fields=id,name,picture', {
            headers: { access_token: accessToken }
        });
        const userData = await userResponse.json();

        if (userData.error) throw new Error(userData.message);

        const zaloId = userData.id;
        const name = userData.name;
        const avatar = userData.picture?.data?.url || '';

        await dbConnect();

        console.log("\n=== 🔑 THÔNG BÁO CHO ADMIN ===");
        console.log("Zalo ID (Từ API Graph) của tài khoản:", zaloId);
        console.log("===============================\n");

        // Match Admin manually if needed via env var
        let user = await User.findOne({ zaloId });
        const isAdmin = process.env.ADMIN_ZALO_ID === zaloId;
        const role = isAdmin ? 'admin' : 'user';

        if (!user) {
            user = await User.create({ zaloId, name, avatar, role });
        } else {
            user.name = name;
            user.avatar = avatar;
            if (isAdmin && user.role !== 'admin') {
                user.role = 'admin';
            }
            await user.save();
        }

        const response = NextResponse.redirect(new URL('/account', url.origin));
        response.cookies.set('muachung_session', user._id.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        });

        return response;

    } catch (error: any) {
        console.error("OAuth Callback Error:", error);
        return NextResponse.redirect(new URL(`/account?error=AuthFailed_${encodeURIComponent(error.message)}`, url.origin));
    }
}
