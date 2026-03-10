/**
 * Zalo Notification Service (ZNS) API Client - Mock/Placeholder Version
 *
 * This module simulates sending ZNS messages to users who have successfully
 * joined a deal or when a deal is closed (chốt đơn).
 *
 * TODO: Replace with real Zalo OA API calls when ZALO_OA_ACCESS_TOKEN is available.
 */

export interface ZNSTemplateData {
    customerName: string;
    productName: string;
    discountCode: string;
    discountPercent: number;
    dealUrl?: string;
}

export interface ZNSResponse {
    success: boolean;
    message: string;
    mockId?: string;
    error?: string;
}

/**
 * Mocks the process of sending a ZNS message with a discount code.
 * 
 * @param phone The customer's phone number (or Zalo user ID in some integrations)
 * @param data The template data to populate the ZNS message
 * @returns A promise that resolves to a mock response object
 */
export async function sendDiscountCodeZNS(phone: string, data: ZNSTemplateData): Promise<ZNSResponse> {
    const token = process.env.ZALO_OA_ACCESS_TOKEN;

    // Build the payload for logging/debugging
    const payload = {
        phone,
        template_id: "TENG_GIAM_GIA_TEMPLATE_ID", // Replace with real template ID later
        template_data: data
    };

    if (!token || token === "mock_token_pending") {
        console.log("--------------------------------------------------");
        console.log("🚀 [MOCK ZNS] GỬI ZALO ZNS (Chưa có OA Token thật)");
        console.log(`📱 Gửi đến SĐT/ZaloID: ${phone}`);
        console.log(`👤 Khách hàng: ${data.customerName}`);
        console.log(`🛍️ Sản phẩm: ${data.productName}`);
        console.log(`🏷️ Mức giảm: ${data.discountPercent}%`);
        console.log(`🎟️ MÃ GIẢM GIÁ: ${data.discountCode}`);
        if (data.dealUrl) console.log(`🔗 Link Deal: ${data.dealUrl}`);
        console.log("--------------------------------------------------");

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            success: true,
            message: "Mock ZNS message sent successfully",
            mockId: `mock_zns_${Date.now()}`
        };
    }

    // --- FUTURE REAL IMPLEMENTATION ---
    /*
    try {
        const response = await fetch('https://business.openapi.zalo.me/message/template', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'access_token': token
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        if (result.error !== 0) {
            console.error("[ZNS Error]", result);
            return { success: false, message: "Zalo API Error", error: result.message };
        }

        return { success: true, message: "ZNS Sent", mockId: result.data.message_id };
    } catch (error: any) {
        console.error("[ZNS Exception]", error);
        return { success: false, message: "Server connection failed", error: error.message };
    }
    */

    // Fallback if token exists but network code is commented out
    return { success: false, message: "Real implementation pending" };
}
