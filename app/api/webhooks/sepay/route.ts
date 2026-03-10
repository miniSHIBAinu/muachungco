import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Deal from '@/lib/models/Deal';
import User from '@/lib/models/User';

// Cấu hình Edge Runtime có thể không hỗ trợ các API Node.js như crypto.createHmac hoàn hảo,
// Do đó chúng ta sẽ dùng Node.js runtime mặc định cho Webhook xử lý file Database mongoose.
// export const runtime = 'nodejs'; (Mặc định)

export async function POST(request: Request) {
    try {
        const bodyText = await request.text();
        const headers = request.headers;

        // 1. Webhook Signature Validation (SePay Security)
        const sepaySignature = headers.get('Authorization');
        const webhookSecret = process.env.SEPAY_WEBHOOK_SECRET;

        if (webhookSecret && sepaySignature) {
            // SePay gửi signature dạng "Apikey <HMAC_SHA256>"
            const token = sepaySignature.replace('Apikey ', '');
            // Tạo chữ ký từ body text và secret
            const hmac = crypto.createHmac('sha256', webhookSecret);
            hmac.update(bodyText);
            const expectedSignature = hmac.digest('hex');

            if (token !== expectedSignature) {
                console.error('Invalid SePay Webhook Signature', { received: token, expected: expectedSignature });
                // Trong môi trường production, return 401. 
                // Tuy nhiên lúc test có thể bỏ qua nếu muốn, ở đây tạm thời chặn luôn.
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        }

        // 2. Phân tích Payload
        const payload = JSON.parse(bodyText);
        /*
          Cấu trúc Payload SePay (Ví dụ):
          {
            "id": 12345,
            "gateway": "Techcombank",
            "transactionDate": "2023-10-10 10:10:10",
            "accountNumber": "1903xxx",
            "code": "MB_12345",
            "content": "MUA 65f1a2 USER 65f1a3",
            "transferType": "in",
            "transferAmount": 50000,
            "accumulated": 1000000,
            "referenceCode": "MB_12345"
          }
        */

        const transferType = payload.transferType; // "in" / "out"
        const amount = payload.transferAmount;
        const message = payload.content as string;

        // Chỉ xử lý giao dịch nhận tiền (in) và số tiền hợp lệ (ví dụ cọc 50k)
        if (transferType !== 'in' || amount < 10000) {
            return NextResponse.json({ success: true, message: 'Ignored: Not an incoming valid payment' });
        }

        // 3. Trích xuất DealID và UserID từ nội dung chuyển khoản
        // Cú pháp quy định UI: "MUA [DealID] [UserID]"
        // Dùng Regex lấy ID, có thể bao gồm ký tự dư thừa do ngân hàng thêm vào
        const match = message.toUpperCase().match(/MUA\s+([A-Z0-9]+)\s+([A-Z0-9]+)/);

        if (!match) {
            return NextResponse.json({ success: true, message: 'Ignored: No valid syntax found in content' });
        }

        const [, shortDealId, shortUserId] = match;

        // 4. Tìm kiếm Deal và User trong Database
        // Vì ObjectId là 24 ký tự hex (khá dài để gõ chuyển khoản), 
        // Frontend sẽ gửi 6 ký tự cuối của DealID và UserID vào mã QR.
        await dbConnect();

        // Tìm deal có ID kết thúc bằng shortDealId (case-insensitive vì MongoDB ObjectId luôn là lowercase hex)
        const deals = await Deal.find({ _id: { $regex: `${shortDealId.toLowerCase()}$` } });
        if (deals.length === 0) {
            console.log(`[Webhook] Deal not found for short ID: ${shortDealId}`);
            return NextResponse.json({ success: true, message: 'Deal not found' });
        }

        const deal = deals[0];

        // Tương tự, Frontend sẽ gửi cú pháp với 6 ký tự cuối của User
        // Chúng ta tin tưởng UserID từ mã QR, và Update thẳng vào document Deal
        // Để an toàn 100%, tìm User map với shortUserId
        const users = await User.find({ _id: { $regex: `${shortUserId.toLowerCase()}$` } });

        if (users.length === 0) {
            console.log(`[Webhook] User not found for short ID: ${shortUserId}`);
            return NextResponse.json({ success: true, message: 'User not found' });
        }

        const user = users[0];

        // 5. Cập nhật Mongo: Thêm user vào những người tham gia
        if (!deal.participants.includes(user._id)) {
            await Deal.findByIdAndUpdate(
                deal._id,
                { $addToSet: { participants: user._id } }
            );
            console.log(`[Webhook] Successfully joined User ${user._id} to Deal ${deal._id}`);
        }

        return NextResponse.json({ success: true, received: true });

    } catch (error: any) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
