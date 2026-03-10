import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendDiscountCodeZNS } from './zns';

describe('Zalo Notification Service (ZNS) Mock', () => {
    beforeEach(() => {
        // Clear env vars before each test to ensure mock behavior
        delete process.env.ZALO_OA_ACCESS_TOKEN;
        // Mock console.log to prevent spamming test output
        vi.spyOn(console, 'log').mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should successfully simulate sending a ZNS message without a token', async () => {
        const phone = '0912345678';
        const data = {
            customerName: 'Test User',
            productName: 'Test Product',
            discountCode: 'MOCK_CODE_123',
            discountPercent: 50,
        };

        const response = await sendDiscountCodeZNS(phone, data);

        expect(response.success).toBe(true);
        expect(response.message).toBe('Mock ZNS message sent successfully');
        expect(response.mockId).toBeDefined();
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[MOCK ZNS]'));
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('MOCK_CODE_123'));
    });

    it('should fall back to real implementation warning if token is set but code is inactive', async () => {
        // Simulate having a real token
        process.env.ZALO_OA_ACCESS_TOKEN = 'real_token_123';

        const response = await sendDiscountCodeZNS('0912345678', {
            customerName: 'A', productName: 'B', discountCode: 'C', discountPercent: 10
        });

        expect(response.success).toBe(false);
        expect(response.message).toBe('Real implementation pending');
    });
});
