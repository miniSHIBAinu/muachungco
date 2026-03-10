import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import User from '@/lib/models/User';
import dbConnect from '@/lib/db';
import { cookies } from 'next/headers';

// Mock Next.js Server Components
vi.mock('next/server', () => ({
    NextResponse: {
        json: vi.fn((data, init) => {
            return {
                ...data,
                status: init?.status || 200,
                cookies: {
                    set: vi.fn(),
                }
            };
        })
    }
}));

vi.mock('@/lib/db', () => ({
    default: vi.fn()
}));

vi.mock('@/lib/models/User', () => ({
    default: {
        findOne: vi.fn(),
        create: vi.fn(),
    }
}));

describe('Auth Zalo Route (Admin Role Logic)', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        process.env.ADMIN_ZALO_ID = 'FOUNDER_ZALO_123';
    });

    it('should assign admin role when a new user logs in with the founder Zalo ID', async () => {
        const mockRequestData = { zaloId: 'FOUNDER_ZALO_123', name: 'Founder CEO' };

        // Mock finding no existing user
        (User.findOne as any).mockResolvedValue(null);

        // Mock creating a new user
        (User.create as any).mockResolvedValue({
            _id: 'mock_id',
            zaloId: 'FOUNDER_ZALO_123',
            name: 'Founder CEO',
            role: 'admin'
        });

        const req = new Request('http://localhost/api/auth/zalo', {
            method: 'POST',
            body: JSON.stringify(mockRequestData)
        });

        const response: any = await POST(req);

        expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
            zaloId: 'FOUNDER_ZALO_123',
            role: 'admin'
        }));

        expect(response.user.role).toBe('admin');
    });

    it('should assign standard user role to regular users', async () => {
        const mockRequestData = { zaloId: 'RANDOM_USER_456', name: 'Random User' };

        (User.findOne as any).mockResolvedValue(null);
        (User.create as any).mockResolvedValue({
            _id: 'mock_id',
            zaloId: 'RANDOM_USER_456',
            name: 'Random User',
            role: 'user'
        });

        const req = new Request('http://localhost/api/auth/zalo', {
            method: 'POST',
            body: JSON.stringify(mockRequestData)
        });

        const response: any = await POST(req);

        expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
            zaloId: 'RANDOM_USER_456',
            role: 'user'
        }));

        expect(response.user.role).toBe('user');
    });
});
