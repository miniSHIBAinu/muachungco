import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const appId = process.env.ZALO_APP_ID;
    if (!appId) {
        return new NextResponse("ZALO_APP_ID is not configured", { status: 500 });
    }

    const url = new URL(request.url);
    const redirectUri = encodeURIComponent(`${url.origin}/api/auth/zalo/callback`);

    // Create the OAuth authorization URL
    // We request 'oauth' and 'profile' permissions minimally
    const zaloAuthUrl = `https://oauth.zaloapp.com/v4/permission?app_id=${appId}&redirect_uri=${redirectUri}&state=login`;

    // Redirect the user to Zalo's login portal
    return NextResponse.redirect(zaloAuthUrl);
}
