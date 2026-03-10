'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    _id: string;
    zaloId: string;
    name: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    loginWithZalo: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check session on mount
        fetch('/api/auth/me')
            .then((res) => {
                if (res.ok) return res.json();
                throw new Error('Not authenticated');
            })
            .then((data) => {
                setUser(data.user);
            })
            .catch(() => {
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const loginWithZalo = async () => {
        try {
            // App ID is a public OAuth client ID (not a secret), safe to hardcode as fallback
            const ZALO_APP_ID_FALLBACK = '2277543135012941336';
            const appId = process.env.NEXT_PUBLIC_ZALO_APP_ID || ZALO_APP_ID_FALLBACK;

            // The ZMP SDK hangs infinitely if called from a standard Zalo chat webview.
            // Also it's only meant to run when packaged and hosted on Zalo's h5.zdn.vn servers for Mini Apps.
            // Therefore, if the user is on our public web domains, we MUST force the Web OAuth flow.
            const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
            const isPublicWebApp = hostname.includes('vercel.app') || hostname.includes('muachung.co');

            if (isPublicWebApp || hostname.includes('localhost')) {
                console.log('Public Web App detected. Bypassing SDK and using Web OAuth 2.0 flow direct link...');
                const safeOrigin = window.location.origin.includes('localhost') ? window.location.origin : window.location.origin.replace('http://', 'https://');
                const redirectUri = encodeURIComponent(`${safeOrigin}/api/auth/zalo/callback`);
                const zaloAuthUrl = `https://oauth.zaloapp.com/v4/permission?app_id=${appId}&redirect_uri=${redirectUri}&state=login`;

                // Direct assignment works better than a 302 redirect for iOS Safari Universal Links
                window.location.href = zaloAuthUrl;
                return;
            }

            let zaloProfile;
            try {
                // Try to use true Zalo Mini App SDK (Only runs properly inside Zalo App)
                const { login, getUserInfo } = await import('zmp-sdk/apis');
                await login({});
                const { userInfo } = await getUserInfo({});
                zaloProfile = {
                    zaloId: userInfo.id,
                    name: userInfo.name,
                    avatar: userInfo.avatar,
                };
            } catch (sdkError) {
                console.warn('Zalo Mini App SDK failed even though inside Zalo. Falling back...', sdkError);
                // Fallback to standard web browser OAuth 2 flow
                const safeOrigin = window.location.origin.includes('localhost') ? window.location.origin : window.location.origin.replace('http://', 'https://');
                const redirectUri = encodeURIComponent(`${safeOrigin}/api/auth/zalo/callback`);
                const zaloAuthUrl = `https://oauth.zaloapp.com/v4/permission?app_id=${appId}&redirect_uri=${redirectUri}&state=login`;
                window.location.href = zaloAuthUrl;
                return; // halt execution here, auth callback route will handle the rest
            }

            const res = await fetch('/api/auth/zalo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(zaloProfile),
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                alert('Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    const logout = async () => {
        await fetch('/api/auth/me', { method: 'POST' });
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithZalo, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
