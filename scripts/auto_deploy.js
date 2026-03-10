const { execSync } = require('child_process');

const token = process.env.VERCEL_TOKEN || 'REDACTED';

async function deploy() {
    try {
        console.log("🔄 1/3 Removing old env vars on Vercel...");
        try { execSync(`npx vercel env rm ZALO_APP_ID production -y --token=${token}`, { stdio: 'ignore' }); } catch (e) { }
        try { execSync(`npx vercel env rm ZALO_SECRET production -y --token=${token}`, { stdio: 'ignore' }); } catch (e) { }

        console.log("✅ 2/3 Injecting new Zalo Authentication IDs to Vercel...");
        execSync(`npx vercel env add ZALO_APP_ID production --token=${token}`, { input: "2277543135012941336", stdio: ['pipe', 'inherit', 'inherit'] });
        execSync(`npx vercel env add ZALO_SECRET production --token=${token}`, { input: "vS8hiDTykBESqUYnbvVk", stdio: ['pipe', 'inherit', 'inherit'] });

        console.log("🚀 3/3 Merging 'feature/phase-12-next-big-thing' into 'main' and triggering Auto Deploy...");
        execSync("git checkout main", { stdio: 'inherit' });
        try { execSync("git pull origin main", { stdio: 'inherit' }); } catch (e) { }
        execSync("git merge feature/phase-12-next-big-thing -m 'Merge feature to main for deployment'", { stdio: 'inherit' });
        execSync("git push origin main", { stdio: 'inherit' });
        execSync("git checkout feature/phase-12-next-big-thing", { stdio: 'inherit' });

        console.log("🎉 ALL DONE! GitHub has been updated and Vercel is now building your site.");
    } catch (err) {
        console.error("❌ Error during deployment:", err.message);
    }
}

deploy();
