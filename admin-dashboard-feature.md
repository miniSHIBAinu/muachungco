# Admin Dashboard Construction

## Goal
Build a secure, data-dense Admin Dashboard to monitor real-time revenue (SePay), manage deals, and track user transactions for effective risk management.

## Tasks
- [x] Task 1: Setup Admin Layout & Security Middleware
  → Verify: Non-admin users visiting `/admin` are redirected; `app/admin/layout.tsx` renders a sidebar.
- [x] Task 2: Implement Admin Dashboard Overview (`/admin`)
  → Verify: KPI Cards (Total Revenue, Active Deals, Total Users) display data correctly.
- [ ] Task 3: Build Deal Management Page (`/admin/deals`)
  → Verify: Data table shows all deals with their current status, and admin can filter them.
- [ ] Task 4: Build Transaction Logs Page (`/admin/transactions`)
  → Verify: Table displays raw SePay webhook logs and user join events.
- [ ] Task 5: Backend API for Admin Aggregation
  → Verify: `GET /api/admin/stats` returns aggregated JSON data from MongoDB.

## Design System (from ui-ux-pro-max)
- **Style:** Data-Dense Dashboard (minimal padding, grid layout, space-efficient).
- **Colors:** Primary Blue (`#2563EB`), CTA Orange (`#F97316`), Muted Slate for backgrounds.
- **Typography:** Fira Sans (Body) + Fira Code (Numbers/Data/Headings) for a precise, technical look.
- **Effects:** Hover tooltips, row highlighting on hover, data loading spinners.

## Done When
- [x] Admin route `/admin` is fully secured.
- [x] KPI KPI metrics, Deals, and Transactions are visible and load data from MongoDB.
- [ ] UI is responsive and data-dense.

## Notes
- We will reuse existing Tailwind configuration but introduce `Fira Sans` and `Fira Code` fonts specifically for the `/admin` area to give it a technical, professional appearance.
