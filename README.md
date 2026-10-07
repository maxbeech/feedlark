# Feedlark

## Search canonicalisation

The public search origin is `https://www.feedlark.com`. Keep all new canonical tags, structured data, feeds, sitemap entries and public links on that host by using `absoluteUrl()` and `PUBLIC_DEMO_PATHS` from `src/lib/utils.ts`. `https://feedlark.com` intentionally returns a permanent redirect to `www`; do not add the apex or the legacy `/feedback` redirect aliases to the sitemap.

**Free customer feedback boards, public roadmap & changelog — no growth tax.**

Feedlark is the free, modern [Canny](https://canny.io) / [Featurebase](https://featurebase.app) alternative.
Collect feature requests, prioritise a public roadmap, and ship a changelog — with **unlimited end-users,
posts and votes on the free plan**. We never charge per voter; optional Pro is a flat $19 per admin seat.

> Built by the OpenHelm Product Factory (Funnel F3 — "proven → better → new" copy-better).

## Analytics

GA4 via `src/lib/openhelm-analytics.tsx` (copied from the shared `openhelm-analytics` service; unset
`NEXT_PUBLIC_GA_MEASUREMENT_ID` means no script and no events). Event names, failure reasons and the
`oh_user_ref` / `oh_plan` user properties live in `src/lib/analytics-events.ts` and
`src/lib/analytics-identity.ts`. To check a change, open GA DebugView on a build with the id set and
walk sign up, log in, create a board, hit a Pro prompt and upgrade; each step should show its event and no
`*_failed` sibling.

## The copy-better thesis

- **Proven** (replicated): public feedback boards, upvoting, comments, status-driven roadmap, changelog + widget.
- **Better** (one axis = price): Canny's free plan caps at 25 *tracked users* and bills per voter — a "growth tax".
  Feedlark's free tier is unlimited end-users; we only ever bill per admin seat.
- **New**: the **"You asked → We shipped" loop** — shipping a roadmap item auto-writes the changelog and
  notifies every voter, badging their original request as Shipped.
- **Growth**: organic SEO (`/alternatives/*`, category + programmatic pages, blog) + GEO (`llms.txt`,
  structured data, every public board/roadmap/changelog is crawlable & AI-citable).
- **Editorial content**: code-backed blog posts in `src/lib/content/` are generated into `/blog`, individual canonical article pages and `sitemap.xml`. Each post includes keyword metadata, accessible featured-image text, FAQ schema and source links.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) on Helm7 (ISR) |
| Styling | Tailwind CSS 3 + hand-rolled UI primitives |
| Database | Supabase (Postgres) + Drizzle ORM (`postgres-js`, transaction pooler) |
| Auth | Custom email + password (bcrypt + `jose` JWT in an httpOnly cookie) |
| Billing | Stripe (env-gated — degrades to Free-only with no 500s) |
| Email | Resend (optional — ship notifications are recorded either way) |

## Develop

```bash
npm install
cp .env.example .env.local   # add DATABASE_URL (Supabase pooler) + AUTH_SECRET
npm run db:push              # apply schema (or use the Supabase MCP)
npm run db:seed              # seed the /feedback demo workspace
npm run dev
npm test                     # vitest (pure logic + SEO content constraints)
npm run typecheck
```

## Key routes

- `/` marketing home · `/pricing` · `/alternatives/{canny,featurebase,productboard,nolt,frill}` · `/use-cases/{slug}` · `/blog`
- `/dashboard` admin (boards, posts, changelog, settings/billing). Stripe's
  signature-verified webhook is the lifecycle authority; a verified Checkout
  return independently repairs a delayed/missed Pro upgrade for that workspace.
- `/b/{workspace}` public board · `/b/{workspace}/roadmap` · `/b/{workspace}/changelog` (+ `/rss`)
- `/widget.js` embeddable widget · `/llms.txt` · `/sitemap.xml`

## Hosting

Feedlark runs on Helm7 (`npm start` honours `$PORT`). The daily maintenance cron
(`/api/cron/ship-notifications`, `7 3 * * *`) is a Helm7 cron service that sends
`Authorization: Bearer $CRON_SECRET`; the route fails closed (503 when
`CRON_SECRET` is unset, 401 when wrong). Rate limits key on `X-Helm7-Client-Ip`.

Customer custom domains are attached through Helm7's domains API, so the app
needs `HELM7_API_KEY` (confined to this product, domain read/write) and
`HELM7_PRODUCT_ID`. Customers add a CNAME to the target the settings page shows.
`test/no-vercel.test.ts` keeps Vercel-only code out.

## Monitoring

Sentry (org `maxed-labs`, project `feedlark_web`) receives errors, logs and user
feedback. Set `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN`; without them a warning is
logged at boot and nothing is reported. Everything is scrubbed in `src/lib/scrub.ts`
before it leaves the process. Server code reports failures with `captureServerError`
(`src/lib/capture.ts`), which accepts ids, counts and short strings only. The scrubber fails closed: if it throws, the event is dropped.

The Sentry scrubber (`src/lib/scrub.ts`) redacts secrets of any length, backs up to a clean boundary when it truncates, and fails closed; its regression tests are in `test/scrub-hardening.test.ts`.

## License

Proprietary. © 2026 Feedlark.
