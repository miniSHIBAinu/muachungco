import { test, expect } from '@playwright/test';

const BASE_URL = 'https://app.muachung.co';
const CORRECT_APP_ID = '2277543135012941336';
const CORRECT_REDIRECT_URI = 'https://app.muachung.co/api/auth/zalo/callback';

test.describe('Zalo Login Flow — Pre-Check & E2E', () => {

    test('Page loads and shows login button when not authenticated', async ({ page }) => {
        await page.goto(BASE_URL);
        const loginBtn = page.getByRole('button', { name: /đăng nhập/i });
        await expect(loginBtn).toBeVisible({ timeout: 10_000 });
    });

    test('Login button produces a Zalo OAuth URL with correct App ID and redirect URI', async ({ page }) => {
        await page.goto(BASE_URL);
        const loginBtn = page.getByRole('button', { name: /đăng nhập/i });
        await expect(loginBtn).toBeVisible();

        // Intercept all requests to catch the Zalo OAuth URL before following
        let capturedZaloUrl = '';
        page.on('request', (req) => {
            const url = req.url();
            if (url.includes('oauth.zaloapp.com') || url.includes('id.zalo.me')) {
                capturedZaloUrl = url;
            }
        });

        await loginBtn.click();
        // Give time to navigate
        await page.waitForTimeout(3000);

        // The current page URL should be on Zalo's domain (login page or oauth page)
        const finalUrl = page.url();
        const wasRedirectedToZalo = finalUrl.includes('zalo.me') || finalUrl.includes('zaloapp.com');
        expect(wasRedirectedToZalo).toBe(true);

        // Verify the Zalo URL contained the correct app_id
        // It may be in the request URL or encoded in the continue= param
        const urlToCheck = capturedZaloUrl || finalUrl;
        expect(urlToCheck).toContain(CORRECT_APP_ID);
        console.log('✅ Zalo URL captured:', urlToCheck);
    });

    test('Zalo OAuth URL contains canonical redirect URI (not vercel.app)', async ({ page }) => {
        await page.goto(BASE_URL);
        const loginBtn = page.getByRole('button', { name: /đăng nhập/i });
        await expect(loginBtn).toBeVisible();

        await loginBtn.click();
        // Wait for Zalo login page to load
        await page.waitForURL(/zalo\.me/, { timeout: 10_000 }).catch(() => { });

        const landingUrl = page.url();
        // The full chain: id.zalo.me/account/login?continue=https%3A%2F%2Foauth.zaloapp.com%...
        // Decoding reveals: redirect_uri=https%3A%2F%2Fapp.muachung.co%2F...
        const decoded = decodeURIComponent(landingUrl);

        // redirect_uri must point to app.muachung.co
        expect(decoded).toContain('app.muachung.co');
        // Must never have vercel.app as redirect
        expect(decoded).not.toContain('vercel.app');
        // App ID must be correct
        expect(decoded).toContain(CORRECT_APP_ID);
        console.log('✅ Landing URL decoded correctly — canonical domain confirmed');
    });

    test('Callback route: Missing code param redirects with error', async ({ page }) => {
        // Use page.goto which follows redirects — we check the final URL
        await page.goto(`${BASE_URL}/api/auth/zalo/callback`);
        await page.waitForTimeout(2000);
        const finalUrl = page.url();
        // Should redirect to /account (possibly with error)
        expect(finalUrl).toContain(`${BASE_URL}/account`);
    });

    test('Sync route: Missing token redirects to /account', async ({ page }) => {
        // Playwright follows redirects by default — check the final URL
        await page.goto(`${BASE_URL}/api/auth/sync`);
        await page.waitForURL(`${BASE_URL}/account`, { timeout: 10_000 });
        expect(page.url()).toContain('/account');
    });

    test('Sync route: Zalo webview User-Agent returns HTML interstitial', async ({ page }) => {
        const response = await page.request.get(`${BASE_URL}/api/auth/sync?token=test-token`, {
            headers: {
                'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) Mobile/15E148 Zalo/23.05.01 ZaloApp'
            },
            // Don't follow redirects so we can check actual status
            maxRedirects: 0,
        });
        // Zalo UA → should return HTML page OR redirect (if no user found with this token)
        expect([200, 307, 302]).toContain(response.status());
        if (response.status() === 200) {
            const body = await response.text();
            expect(body).toContain('Xác thực Zalo thành công');
        }
    });
});
