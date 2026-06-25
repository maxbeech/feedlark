# Feedlark

**Free customer feedback boards, public roadmap & changelog — no growth tax.**

Feedlark is the free, modern [Canny](https://canny.io) / [Featurebase](https://featurebase.app) alternative.
Collect feature requests, prioritise a public roadmap, and ship a changelog — with **unlimited end-users,
posts and votes on the free plan**. We never charge per voter; optional Pro is a flat $19 per admin seat.

> Built by the OpenHelm Product Factory (Funnel F3 — "proven → better → new" copy-better).

## The copy-better thesis

- **Proven** (replicated): public feedback boards, upvoting, comments, status-driven roadmap, changelog + widget.
- **Better** (one axis = price): Canny's free plan caps at 25 *tracked users* and bills per voter — a "growth tax".
  Feedlark's free tier is unlimited end-users; we only ever bill per admin seat.
- **New**: the **"You asked → We shipped" loop** — shipping a roadmap item auto-writes the changelog and
  notifies every voter, badging their original request as Shipped.
- **Growth**: organic SEO (`/alternatives/*`, category + programmatic pages, blog) + GEO (`llms.txt`,
  structured data, every public board/roadmap/changelog is crawlable & AI-citable).

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) on Vercel (ISR) |
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
- `/dashboard` admin (boards, posts, changelog, settings/billing)
- `/b/{workspace}` public board · `/b/{workspace}/roadmap` · `/b/{workspace}/changelog` (+ `/rss`)
- `/widget.js` embeddable widget · `/llms.txt` · `/sitemap.xml`

## License

Proprietary. © 2026 Feedlark.
