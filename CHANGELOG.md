# Changelog

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
