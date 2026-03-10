import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const userAgent = request.headers.get('user-agent') || '';
    const isZalo = /Zalo/i.test(userAgent);
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
        return NextResponse.redirect(new URL('/account', url.origin));
    }

    if (isZalo) {
        // Provide a beautiful interstitial page instructing user to open in Safari/Chrome
        const html = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Đăng nhập thành công</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f8fafc; color: #0f172a; text-align: center; padding: 20px; box-sizing: border-box; }
                .card { background: white; padding: 40px 24px; border-radius: 24px; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); max-width: 400px; width: 100%; border: 1px solid #e2e8f0; }
                .icon { width: 80px; height: 80px; background: #dcfce7; color: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 40px; font-weight: bold; }
                h1 { margin: 0 0 12px; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
                p.subtitle { margin: 0 0 24px; font-size: 16px; color: #475569; line-height: 1.5; }
                .instruction { background: #eff6ff; border-radius: 16px; padding: 20px; margin-bottom: 24px; text-align: left; }
                .instruction p { margin: 0; color: #1e40af; font-weight: 600; font-size: 15px; display: flex; align-items: center; gap: 8px; }
                .instruction p + p { margin-top: 12px; }
                .instruction strong { color: #1d4ed8; background: #dbeafe; padding: 2px 8px; border-radius: 6px; }
                .dots-icon { writing-mode: vertical-rl; text-orientation: upright; font-weight: 900; letter-spacing: -2px; font-size: 18px; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="icon">✓</div>
                <h1>Xác thực Zalo thành công!</h1>
                <p class="subtitle">Hệ thống đã ghi nhận tài khoản của bạn. Để tiếp tục mua sắm, vui lòng chuyển về trình duyệt web gốc (Safari/Chrome).</p>
                
                <div class="instruction">
                    <p>
                        <span style="font-size: 20px; font-weight: bold;">1.</span>
                        <span>Bấm vào dấu <strong class="dots-icon">...</strong> (hoặc ⋮) ở góc trên bên phải màn hình.</span>
                    </p>
                    <p>
                        <span style="font-size: 20px; font-weight: bold;">2.</span>
                        <span>Chọn <strong>Mở bằng trình duyệt</strong> (Open in browser).</span>
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
        return new NextResponse(html, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
            },
        });
    }

    // Not Zalo -> Consume token and log in
    await dbConnect();
    const user = await User.findOne({ loginToken: token });

    if (!user) {
        return NextResponse.redirect(new URL('/account?error=SessionExpiredOrUsed', url.origin));
    }

    // Clear token for security
    user.loginToken = undefined;
    await user.save();

    const response = NextResponse.redirect(new URL('/account', url.origin));
    response.cookies.set('muachung_session', user._id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    });

    return response;
}
