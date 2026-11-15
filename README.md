# YAGA GROUP Website — Implementation Starter

A unified Next.js platform for YAGA MOBILES, YAGA GOLD & FASHION and YAGA DIGITAL NEXUS.

## Included in this implementation
- Responsive YAGA GROUP landing page and division-specific storefront pages.
- Product/category browsing with sample data clearly marked as demo.
- WhatsApp enquiry links with product details prefilled.
- Enquiry form that records to Supabase when configured; otherwise gives a clear setup message.
- Central admin login, enquiry status updates and a manual “Create order” action (Supabase Auth required).
- Supabase SQL schema, RLS policies and seed division records.
- Existing Digital Nexus HTML preserved byte-for-byte under `public/digital-nexus.html` and displayed at `/digital` in an iframe.
- Manual order confirmation workflow: enquiry → team contact → confirmation → admin status update.

## Run locally
1. Install Node.js 20+.
2. Copy `.env.example` to `.env.local`.
3. `npm install`
4. `npm run dev`
5. Open http://localhost:3000

The storefront and demo catalogue render without Supabase. Enquiry persistence, manual order creation and admin login require Supabase credentials and SQL setup.

## Supabase setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL Editor.
3. Run the Phase 1 migration `supabase/migrations/0001_phase1_foundation.sql` (roles, permissions, audit logs, settings, RLS helpers). Either paste into the SQL Editor, or:
   ```
   SUPABASE_DB_PASSWORD=... npm run db:migrate 0001_phase1_foundation.sql
   ```
4. Configure Auth email/password users. Promote your bootstrap account to `super_admin` (the migration does this for `admin@yagagroup.com`; otherwise update `profiles.role` manually).
5. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and the server-only `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`.
6. Set Site URL and redirect URLs in Supabase Auth settings.

## Admin architecture (Phase 1)
- Single Supabase Auth login at `/admin/login`.
- Server-side authorization (`src/lib/admin-auth.ts`): super admin, group admin, division scope, category scope, module scope, and effective permissions.
- Middleware (`src/middleware.ts`) protects `/admin/*` and `/api/admin/*`.
- Super Admin area (`/admin/super/*`): user & role assignment, audit logs, system settings.
- Role templates seeded in `roles` + `permissions`; assign via Users & Roles.
- Audit logging via `src/lib/audit.ts` (service-role, append-only).

## Before production
- Replace sample catalogue products and images with verified inventory.
- Confirm official WhatsApp number for each division. Current values are placeholders.
- Confirm prices, wholesale approval rules, MOQ, shipping, COD, returns and privacy policy.
- Configure Supabase RLS and test with non-admin accounts.
- Configure domain, analytics, Meta Pixel/Conversions API, email/WhatsApp provider and backups.
- Have the Digital Nexus missing 300 full-resolution hero frames supplied if the current HTML expects them; this ZIP's HTML is retained as-is and may use its embedded fallback.
- Run `npm run build` and full security/functional testing before deployment.

## Important
This is a runnable implementation starter, not a deployed live website. It does not create a Supabase project, configure payment accounts, or publish to a domain. No real customer data or credentials are included.
