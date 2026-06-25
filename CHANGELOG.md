# Changelog

## 0.6.0 - 2026-06-26

Database migrated from Turso (libSQL/SQLite) to Supabase (Postgres).

### Changed
- **Drizzle dialect**: `sqlite-core` → `pg-core`. Booleans are real `boolean` columns; timestamps stay Unix-epoch `bigint` so all date handling is unchanged.
- **Driver**: `@libsql/client` → `postgres-js` against the Supabase transaction pooler (`prepare:false`, serverless-friendly). `@libsql/client` removed.
- **Edge middleware**: custom-domain lookup now uses the Supabase REST API (service-role, edge-safe) instead of an edge libSQL client — middleware bundle shrank ~35%.
- Driver-specific fixes: `db.execute` for raw SQL; `.returning().length` instead of `.rowsAffected` (webhook idempotency, ship-claim).
- `DATABASE_URL` / `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` replace `TURSO_*` in Vercel + `.env.example`.

### Data & security
- All existing data migrated and verified (2 users, 2 workspaces, 2 boards, 7 posts, 141 votes, 2 changelog entries) — the dogfood `/b/feedlark` roadmap is intact.
- RLS enabled (deny-all) on all 12 tables; the app uses the direct Postgres role (bypasses RLS), so the public Data API exposes nothing. Locked down a pre-existing `anon`-executable `SECURITY DEFINER` function. Supabase MCP wired into the project.
- Verified on production: `/api/health` db:up, board reads, vote write+recount (42→43→42), signup write + verification gate.

## 0.5.0 - 2026-06-25

Production-readiness hardening for real paying customers (billing correctness, abuse protection, reliable email, legal + observability).

### Billing correctness
- Cancellation now cleans up paid resources: clears the custom domain and prunes extra admin seats + pending invites back to the single free seat (previously left orphaned and free).
- `past_due`/`unpaid`/`incomplete` are a grace state that keeps Pro (Stripe Smart Retries recover most); only a real cancel/delete downgrades.
- Webhook idempotency ledger (`stripe_events`) so Stripe's at-least-once retries don't re-run side-effects.
- Checkout redirects existing live subscribers to the Billing Portal instead of creating a second subscription; collects billing address; `automatic_tax`/`tax_id_collection` gated behind `STRIPE_TAX_ENABLED`.
- Pinned Stripe API version.

### Abuse & security
- Rate limiting (Upstash, fail-open until provisioned) on login, signup, password reset, verification resend, post, comment and vote (plus a per-IP vote cap).
- Email verification on signup (only enforced when email is configured; invited users and password reset auto-verify). New `/check-email` page + resend; `/api/auth/verify`.
- Stateless session revocation via `users.session_epoch` embedded in the JWT, bumped on password reset (which also makes reset links single-use).
- Timing-safe login (constant-work bcrypt compare; no user enumeration); bcrypt cost 10 → 12.
- Security headers globally (HSTS, nosniff, Referrer-Policy, Permissions-Policy) and clickjacking protection on dashboard + auth surfaces (public `/b/*` left frameable for the widget).

### Email closed-loop
- Ship notifications are queued (no recipient cap — the old 500 silent drop is gone) and drained in the background via `after()`, with a daily cron backstop and retries.
- Resend Batch API with `List-Unsubscribe` one-click headers (Gmail/Yahoo bulk compliance); `/api/unsubscribe` and a Svix-verified `/api/resend/webhook` that auto-suppresses bounces/complaints.

### Legal & observability
- Substantive Terms, Privacy (named subprocessors, UK/EU GDPR rights, retention, contact) and a Cookie notice; footer link.
- Sentry error monitoring (server via instrumentation; client dynamically imported to stay out of the first-load bundle); Vercel Analytics; `/api/health` DB readiness probe.

### Schema
- Added `stripe_events`, `email_suppressions`; `ship_notifications` queue columns; `users.email_verified` / `users.session_epoch` (existing users backfilled to verified). Applied to production Turso.

## 0.4.1 - 2026-06-25

Go-live: real payments and the custom domain.

### Fixed
- **Authed dashboard 500**: every `/dashboard/*` route server-errored because the dashboard layout passed Lucide icon *components* (functions) to the `"use client"` `NavTabs`, which React Server Components cannot serialise across the server/client boundary. Now passes pre-rendered icon elements (`ReactNode`). Verified end-to-end: Boards, Changelog, Team and Settings all render.

### Launch configuration
- **Stripe live**: created the live "Feedlark Pro" product, a $19/mo per-seat price and a live webhook (`https://www.feedlark.com/api/stripe/webhook`) on a dedicated Feedlark Stripe account; swapped `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PRO_MONTHLY` and `STRIPE_WEBHOOK_SECRET` to live. The upgrade flow creates a real `cs_live_…` Checkout session showing Feedlark Pro at US$19.00/month.
- **Custom domain live**: `feedlark.com` resolves; apex 308-redirects to `www`. Flipped `NEXT_PUBLIC_SITE_URL` to `https://www.feedlark.com` (canonical, non-redirecting host) so canonical/OG tags, Stripe success/cancel URLs and email links all avoid a redirect hop.

## 0.4.0 - 2026-06-20

A complete, compelling Pro tier and the production billing/email wiring for launch.

### Added (Pro)
- **Team & seats**: invite teammates by email, a pending-invites list, remove members, and a 7-day tokenised accept flow. New teammates sign up through the invite link and join the workspace directly (no stray personal workspace). Owner-only management; Free stays single-seat.
- **Per-seat billing**: checkout starts at the current admin count, and adding or removing a teammate syncs the Stripe subscription quantity (prorated). Honestly "$19 per admin seat, never per voter."
- **Workspace switcher**: users who belong to more than one workspace can switch the active one from the dashboard header; every dashboard query and billing action follows the active workspace.
- **Duplicate merge**: the smart-duplicate detector now has a one-click "merge" that moves votes (deduped per voter) and comments into the top post and deletes the rest.
- **Internal notes**: private team notes on any post, never shown on public pages.
- **CSV export**: download a board's feedback as CSV.
- Plan features are now a single source of truth (`PRO_FEATURES`) shared by the pricing page and the in-app billing card.

### Launch configuration
- Stripe product, $19/mo price and webhook endpoint created via the Stripe CLI; `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PRO_MONTHLY` and `STRIPE_WEBHOOK_SECRET` wired into production.
- Resend wired (`RESEND_API_KEY`, `EMAIL_FROM=noreply@mail.feedlark.com`); transactional + notification email activates once the sending domain's DNS verifies.
- Domain references made consistent and env-driven (`feedlark.com`); the embeddable widget de-emojified and rebranded.

## 0.3.0 - 2026-06-19

A full design and quality pass: a distinctive, premium, human-feeling identity plus a second round of bug fixes.

### Design
- **New visual identity.** Editorial display serif (Fraunces) paired with Inter, a warm "paper" palette (warm ink, cream, sand) that agrees with the brand orange, a refined lark logo, soft layered shadows, and a blueprint-grid + grain texture replacing the generic dotted background. Single source of truth in `tailwind.config.ts`, `globals.css` and `ui.tsx`.
- **Interactive, app-accurate mockups.** A reusable mockup library (`components/marketing/mockups/`) that mirrors the real product: a clickable hero board you can actually upvote, a roadmap board, a changelog feed, an embeddable-widget preview, and a signature "ship it" loop demo where one click moves a card to Shipped, writes the changelog and notifies voters.
- **Marketing rebuilt** around those mockups: new home (hero, growth-tax comparison, loop demo, feature rows), pricing, alternatives, use-cases, blog and about, all with the new system.
- **App + public boards** brought onto the system: active-state nav tabs, warm dashboard and board chrome, premium auth screens, branded 404 / error / loading states.

### De-AI'd copy
- Removed every em dash from user-facing copy and rewrote AI-cliché phrasing across pages, content and email/changelog templates. Added a test that fails the build if an em or en dash reappears in the copy files.

### Fixed
- **Private boards are now actually private.** Posts on private boards no longer leak onto the public roadmap, its JSON-LD, or the public post-detail page.
- **Password reset no longer falls back to a known dev secret** in production; it shares the single hardened `authSecret()` with sessions.
- **Status integrity:** "complete" can only be reached through the ship-loop, so a post can never show as "Shipped" without a changelog behind it; shipped posts can be reopened.
- **Stripe webhook** now verifies the Pro price and a paid status before granting Pro, and handles `subscription.created`.
- **Custom domains** are enforced unique, so one cannot hijack another workspace's routing.
- Stronger email validation (no more storing/emailing `a@`), authoritative vote recount on new posts, and consistent ISR revalidation of every public surface on writes/deletes.

## 0.2.0 - 2026-06-19

Critical pre-launch audit pass (independent code review + UX review) — hardening to seed-startup quality.

### Fixed
- **Vote count integrity**: recompute from authoritative `COUNT(votes)` on every vote; race-tolerant (unique-index conflicts caught); no more drift.
- **Markdown rendering**: changelog bodies (incl. the auto-generated "ship it" entry) now render `**bold**` / links via a safe React renderer instead of showing literal asterisks.
- **Ship-it loop**: idempotent (atomic conditional claim — no duplicate changelog/notifications on double-click); notification emails now sent in parallel + batched (no timeout on popular posts).
- **N+1 queries**: board post-counts via a single grouped query.

### Added
- **Board filtering, sorting & search** on public boards (status chips, Top/New, search) — addresses the #1 Canny complaint.
- **Moderation**: edit/delete posts, delete comments, edit/delete boards, delete changelog entries (all authz-gated); spam **honeypot** on public forms.
- **"Notify me when this ships"** email capture on posts (powers the loop).
- **Password reset** (stateless signed-token flow; graceful when email unconfigured) + "Forgot password?" link.
- **Custom domain**: real host→workspace routing (edge middleware) + Pro settings field with DNS instructions.
- **ISR** on public roadmap/changelog/workspace pages (+ on-demand revalidation on writes) — Vercel free-tier friendly.
- Marketing: two-column hero with a product preview, dynamic **OG image**, **mobile nav**.
- Branded **404 / error / loading** states; "Welcome to Pro" confirmation.

### Changed
- "AI duplicate-clustering" honestly relabeled **"Smart duplicate detection"** (it's deterministic similarity).
- `AUTH_SECRET` now fails hard in production instead of falling back to a known dev secret; accent colour validated as hex.

## 0.1.0 — 2026-06-18

Initial release. Built end-to-end by the OpenHelm Product Factory (Funnel F3).

### Added
- **Auth**: email + password sign-up / login (bcrypt + JWT cookie); workspace + default board auto-created on signup.
- **Feedback boards**: public boards with one-click (no-login) upvoting, posts and comments.
- **Public roadmap**: Planned / In Progress / Shipped, derived automatically from post statuses.
- **Changelog**: admin entries + public page + RSS feed + in-app "what's new" widget.
- **"You asked → We shipped" loop**: shipping a roadmap item auto-creates the changelog entry and notifies every voter who left an email.
- **Embeddable widget** (`/widget.js`): floating feedback button + board modal for any site.
- **Billing**: Stripe Free/Pro (per admin seat), env-gated with graceful 503s.
- **Smart duplicate detection** (Pro): similarity clustering of feedback titles.
- **Marketing + SEO/GEO**: home, pricing, programmatic `/alternatives/*` and `/use-cases/*` pages, a 6-post blog, `sitemap.xml`, `robots.txt`, `llms.txt`, schema.org JSON-LD.
- Vitest suite covering pure logic + SEO content constraints (21 tests).
