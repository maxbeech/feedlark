# Changelog

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
