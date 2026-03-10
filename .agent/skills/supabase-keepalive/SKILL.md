---
name: supabase-keepalive
description: >
  Keep Supabase free tier (freetier) always alive via GitHub Actions.
  Prevents auto-pause and project deletion caused by 7-day inactivity rule.
  Includes correct cron timing, workflow template, GitHub Secrets setup,
  and common pitfalls with tested fixes.
skills:
  - bash-linux
  - deployment-procedures
---

# Supabase Keep-Alive Skill

## 🎯 Problem

Supabase **free tier** auto-pauses projects after **7 days** of no API activity.
After **90 days** of being paused, the project is **permanently deleted**.

> This applies to: Flutter, Next.js, React, Node.js apps — any project using Supabase.

---

## ⚡ Solution: GitHub Actions Ping Workflow

A scheduled cron job that pings Supabase REST + Auth endpoints every **4 days**.

### Why 4 days, not 5 or 7?

| Cron Pattern | Max Gap (worst case) | Safe? |
|---|---|---|
| `*/7` (every 7 days) | 7 days | ❌ No margin |
| `*/5` (every 5 days) | 8 days in Feb (25→5) | 🔴 **BUG — can cause pause!** |
| `*/4` (every 4 days) | 4 days always | ✅ 3-day safety buffer |
| `0 8 * * 1,4` (Mon+Thu) | 4 days max | ✅ Also good |

> 🔴 **Critical Bug:** `*/5` seems safe but February breaks it:
> Feb 25 → Mar 5 = **8 days** which exceeds the 7-day limit!
> **Always use `*/4` or twice-a-week cron.**

---

## 📋 Implementation Steps

### Step 1: Add GitHub Secrets

In GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret Name | Value |
|---|---|
| `SUPABASE_URL` | `https://xxxxxxxxxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

> Find these in: Supabase Dashboard → Project Settings → API

### Step 2: Create Workflow File

Create `.github/workflows/supabase-keepalive.yml`:

```yaml
name: Supabase Keep-Alive

on:
  schedule:
    # Every 4 days at 08:00 UTC — max gap always ≤ 4 days
    # DO NOT use */5 — causes 8-day gap in February (Feb 25 → Mar 5)!
    - cron: '0 8 */4 * *'
  workflow_dispatch: # Manual trigger from Actions tab

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Supabase Auth
        continue-on-error: true
        run: |
          HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
            --max-time 30 \
            "${{ secrets.SUPABASE_URL }}/auth/v1/settings" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}")
          echo "Supabase Auth responded with HTTP $HTTP_STATUS"
          if [ "$HTTP_STATUS" -ne 200 ]; then
            echo "::error::Supabase Auth is not responding (HTTP $HTTP_STATUS)"
            exit 1
          fi

      - name: Ping Supabase REST API
        continue-on-error: true
        run: |
          HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
            --max-time 30 \
            "${{ secrets.SUPABASE_URL }}/rest/v1/" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}")
          echo "Supabase REST API responded with HTTP $HTTP_STATUS"
          if [ "$HTTP_STATUS" -ne 200 ]; then
            echo "::error::Supabase REST API is not responding (HTTP $HTTP_STATUS)"
            exit 1
          fi

      - name: Summary
        run: echo "✅ Supabase keep-alive ping completed — next run in ~4 days"
```

### Step 3: Verify

1. GitHub repo → **Actions** tab
2. Select **Supabase Keep-Alive** workflow
3. Click **Run workflow** → **Run workflow** (green button)
4. Watch it complete in ~10 seconds ✅

---

## 🔍 Endpoint Choice — Why These Two?

| Endpoint | Purpose | Auth Required | Notes |
|---|---|---|---|
| `/auth/v1/settings` | Ping Auth service | ❌ anon key only | Always public |
| `/rest/v1/` | Ping REST/DB API | ❌ anon key only | Root returns 200 |

**Do NOT ping** `/rest/v1/some_table` — requires RLS to be configured and may return 401/403, causing false failures.

---

## ⚠️ Common Pitfalls

### Pitfall 1: Using `*/5` cron (BUG)
```yaml
# ❌ WRONG — 8-day gap in February
- cron: '0 8 */5 * *'

# ✅ CORRECT
- cron: '0 8 */4 * *'
```

### Pitfall 2: Missing `continue-on-error`
Without it, if Auth ping fails, REST ping never runs → no debug info.
```yaml
# ✅ Always add to each ping step
continue-on-error: true
```

### Pitfall 3: Secrets not set
Workflow silently sends requests to empty URL (`/auth/v1/settings`) → curl error.
Check: Actions log → look for `HTTP 000` or curl error.

### Pitfall 4: Wrong URL format
```bash
# ❌ Wrong
SUPABASE_URL=xxxxxxxxxxxx.supabase.co    # missing https://

# ✅ Correct
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
```

### Pitfall 5: Project already paused
If project was already paused, the ping won't un-pause it automatically.
You must manually resume at: `app.supabase.com` → project → **Restore project**.

---

## 🧪 Testing Locally (Before Pushing)

```bash
# Test Auth endpoint
curl -v "$SUPABASE_URL/auth/v1/settings" \
  -H "apikey: $SUPABASE_ANON_KEY"
# Expected: HTTP 200

# Test REST endpoint  
curl -v "$SUPABASE_URL/rest/v1/" \
  -H "apikey: $SUPABASE_ANON_KEY"
# Expected: HTTP 200
```

---

## 📊 Cron Schedule Reference

```
┌─── minute (0-59)
│  ┌─── hour in UTC (0-23)
│  │  ┌─── day of month (1-31)
│  │  │    ┌─── month (1-12)
│  │  │    │  ┌─── day of week (0-6, Sun=0)
│  │  │    │  │
0  8  */4  *  *
│  │   └────── every 4th day: 4,8,12,16,20,24,28
│  └────────── 08:00 UTC = 15:00 Vietnam time
└───────────── at minute 0 (exact hour)
```

### Alternative: Twice a week (Mon + Thu)
```yaml
- cron: '0 8 * * 1,4'  # Monday and Thursday
```

---

## ✅ Verification Checklist

Before considering this done, confirm:

- [ ] `SUPABASE_URL` secret set (with `https://` prefix)
- [ ] `SUPABASE_ANON_KEY` secret set
- [ ] Workflow file at `.github/workflows/supabase-keepalive.yml`
- [ ] Cron is `*/4` NOT `*/5`
- [ ] Both steps have `continue-on-error: true`
- [ ] Manual trigger test passed (HTTP 200 both endpoints)
- [ ] Verify next scheduled run date is within 4 days

---

## 🔗 Related Skills

- `bash-linux` — curl command patterns
- `deployment-procedures` — CI/CD workflow setup
- `server-management` — monitoring and alerting

---

## 📚 References

- [Supabase Free Tier Limits](https://supabase.com/pricing)
- [GitHub Actions Cron Syntax](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
- [crontab.guru](https://crontab.guru/) — visual cron debugger
