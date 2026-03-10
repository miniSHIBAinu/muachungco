import { vi, describe, it, expect, beforeEach } from 'vitest';
import { GET } from './route';
import User from '@/lib/models/User';
import dbConnect from '@/lib/db';

// Mock dependencies
vi.mock('@/lib/db', () => ({
    default: vi.fn(),
}));

vi.mock('@/lib/models/User', () => ({
    default: {
        findOne: vi.fn(),
    },
}));

describe('Auth Sync Route (Magic Link)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should redirect to account if no token is provided', async () => {
        const request = new Request('https://app.muachung.co/api/auth/sync');
        const response = await GET(request);

        expect(response.status).toBe(307);
        expect(response.headers.get('location')).toBe('https://app.muachung.co/account');
    });

    it('should show HTML instructions to escape Safari Sandbox if User-Agent is Zalo', async () => {
        const request = new Request('https://app.muachung.co/api/auth/sync?token=test-token', {
            headers: {
                'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 ZaloTheme/light ZaloLanguage/vn com.vng.zalo/23.05.01 Zalo/23.05.01 ZaloApp',
            },
        });

        const response = await GET(request);

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/html');

        const html = await response.text();
        expect(html).toContain('Xác thực Zalo thành công!');
        expect(html).toContain('Mở bằng trình duyệt');
    });

    it('should redirect with error if token is invalid or expired', async () => {
        const request = new Request('https://app.muachung.co/api/auth/sync?token=invalid-token', {
            headers: {
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/537.36',
            },
        });

        // Mock no user found
        (User.findOne as any).mockResolvedValue(null);

        const response = await GET(request);

        expect(response.status).toBe(307);
        expect(response.headers.get('location')).toContain('error=SessionExpiredOrUsed');
    });

    it('should authenticate user and clear token if valid and not in Zalo Webview', async () => {
        const request = new Request('https://app.muachung.co/api/auth/sync?token=valid-token', {
            headers: {
                'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1',
            },
        });

        const mockUser = {
            _id: 'mock-user-id',
            loginToken: 'valid-token',
            save: vi.fn().mockResolvedValue(true),
        };

        (User.findOne as any).mockResolvedValue(mockUser);

        const response = await GET(request);

        expect(User.findOne).toHaveBeenCalledWith({ loginToken: 'valid-token' });
        expect(mockUser.loginToken).toBeUndefined(); // Token should be cleared for security
        expect(mockUser.save).toHaveBeenCalled();

        expect(response.status).toBe(307);
        expect(response.headers.get('location')).toBe('https://app.muachung.co/account');

        // Assert cookie is set
        const setCookieHeader = response.headers.get('set-cookie');
        expect(setCookieHeader).toContain('muachung_session=mock-user-id');
        expect(setCookieHeader).toContain('HttpOnly');
    });
});
