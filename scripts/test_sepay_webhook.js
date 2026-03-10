const crypto = require('crypto');

async function testWebhook() {
    // Mock Payload with DealID and UserID placeholders
    const payload = {
        id: 101010,
        gateway: "VietQR",
        transactionDate: "2026-03-10 12:00:00",
        accountNumber: "0912345678",
        content: "MUA 123456 789012", // You can replace these with real short IDs to test DB insertion
        transferType: "in",
        transferAmount: 50000,
        referenceCode: "MB_TEST101"
    };

    const payloadText = JSON.stringify(payload);
    const secret = "spsk_test_DFmzdae8bPRgicKU2PUzi3iUtv1SMgph";

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payloadText);
    const signature = hmac.digest('hex');

    console.log("Sending Webhook Payload:", payload.content);
    console.log("Signature:", signature);

    try {
        const response = await fetch("http://localhost:3000/api/webhooks/sepay", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Apikey ${signature}`
            },
            body: payloadText
        });

        const data = await response.json();
        console.log("Receiver Response Status:", response.status);
        console.log("Receiver Output:", data);
    } catch (err) {
        console.error("Failed to connect to localhost:", err.message);
    }
}

testWebhook();
