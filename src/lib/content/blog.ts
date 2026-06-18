export interface Block {
  h2?: string;
  p?: string;
  ul?: string[];
}

export interface BlogPost {
  slug: string;
  title: string; // <= 56 chars (brand suffix is appended)
  description: string; // 140-158 chars
  date: string; // YYYY-MM-DD
  keyword: string;
  readMins: number;
  blocks: Block[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "canny-pricing-explained",
    title: "Canny pricing in 2026: what it really costs",
    description:
      "A clear breakdown of Canny's 2026 pricing, the 25-tracked-user free cap and per-user billing — plus how to avoid the growth tax with a free alternative.",
    date: "2026-06-18",
    keyword: "canny pricing",
    readMins: 4,
    blocks: [
      { p: "Canny is the best-known customer feedback tool, but its pricing is the most common reason teams start looking elsewhere. Here's how it works in 2026 and what to watch for." },
      { h2: "The free plan caps at 25 tracked users", p: "Canny's free plan limits you to 25 tracked users. A tracked user is anyone who posts, votes or comments — so an embedded feedback board can blow past 25 in a single launch day." },
      { h2: "Paid plans bill per tracked user", p: "In 2025 Canny moved to per-tracked-user billing and retired its older generous free plan. Paid plans start around $79/mo (billed yearly) and scale up with your user count, which is why bills can climb into the hundreds per month as you grow." },
      { h2: "Why this is a 'growth tax'", p: "The more successful your feedback board becomes, the more you pay — even though extra voters don't cost you anything to serve. Many teams describe this as being punished for engagement." },
      { h2: "How to avoid it", p: "Feedlark takes the opposite approach: unlimited end-users, posts and votes for free, billed only per admin seat ($19/mo) if you want brand and team extras. Your 26th user is free, and so is your 26,000th." },
    ],
  },
  {
    slug: "best-canny-alternatives",
    title: "7 best Canny alternatives in 2026 (free & paid)",
    description:
      "Compare the best Canny alternatives in 2026 — Feedlark, Featurebase, Frill, Nolt, Productboard, Upvoty and Fider — by price, free plan and core features.",
    date: "2026-06-17",
    keyword: "canny alternatives",
    readMins: 6,
    blocks: [
      { p: "If Canny's per-user pricing or 25-user free cap pushed you to look around, here are seven alternatives worth knowing — and how they differ on the thing that matters most: price as you grow." },
      { h2: "The shortlist", ul: [
        "Feedlark — free for unlimited users; $19/seat Pro; auto 'You asked → We shipped' notifications.",
        "Featurebase — free with unlimited end-users; per-seat from $29; broad support suite.",
        "Frill — clean and simple; from ~$25/mo; white-label on higher tiers.",
        "Nolt — beautifully designed flat ~$29/mo per board; no API/AI.",
        "Productboard — enterprise PM platform; per-maker pricing; powerful but heavy.",
        "Upvoty — affordable, from ~$15/mo; simple boards.",
        "Fider — open-source, self-host for free.",
      ] },
      { h2: "How to choose", p: "If you want a focused feedback board, public roadmap and changelog without paying more as more users engage, prioritise tools that bill per admin seat (or are free) rather than per tracked user." },
      { h2: "Our pick for value", p: "Feedlark is free for unlimited users and only charges per admin seat, so it's the most predictable option for products expecting growth." },
    ],
  },
  {
    slug: "how-to-build-public-roadmap",
    title: "How to build a public product roadmap",
    description:
      "A practical guide to building a public product roadmap that builds trust: what to include, how to set statuses, and how to keep it updated automatically.",
    date: "2026-06-16",
    keyword: "public product roadmap",
    readMins: 5,
    blocks: [
      { p: "A public roadmap turns 'when are you building X?' into a link you can share. Done well, it builds trust and reduces support load. Here's how to set one up." },
      { h2: "Start from real feedback", p: "Don't invent a roadmap in a vacuum. Collect feature requests on a board, let users vote, and promote the highest-signal items. Votes are your prioritisation data." },
      { h2: "Use simple statuses", p: "Three columns are enough for most teams: Planned, In Progress and Shipped. Map each request to a status and your roadmap builds itself." },
      { h2: "Close the loop when you ship", p: "When something ships, move it to Shipped and tell the people who asked. Tools like Feedlark do this automatically — generating a changelog entry and notifying every voter." },
      { h2: "Keep it public and indexable", p: "Host the roadmap on a public, server-rendered page so search engines and AI assistants can surface what you're building when people ask." },
    ],
  },
  {
    slug: "feature-request-tracking",
    title: "How to track feature requests without chaos",
    description:
      "Feature requests scattered across Slack, email and support tickets? Here's a simple system to capture, prioritise and act on them with a feedback board.",
    date: "2026-06-15",
    keyword: "feature request tracking",
    readMins: 4,
    blocks: [
      { p: "Most teams lose feature requests in DMs, support tickets and meeting notes. A single board fixes that — here's the workflow." },
      { h2: "Capture everything in one place", p: "Give users one public board to post ideas. Route requests from support and sales there too, so nothing is lost." },
      { h2: "Let votes do the prioritising", p: "Instead of guessing, let users upvote. The most-requested items rise to the top, giving you a data-backed priority list." },
      { h2: "Respond and set status", p: "Reply as the team, set a status, and the request becomes part of your public roadmap. Users see they were heard." },
    ],
  },
  {
    slug: "changelog-best-practices",
    title: "Changelog best practices for product teams",
    description:
      "How to write a product changelog users actually read: cadence, structure, tone, and how to link releases back to the feature requests that inspired them.",
    date: "2026-06-14",
    keyword: "changelog best practices",
    readMins: 4,
    blocks: [
      { p: "A changelog is free marketing and retention — if people read it. These practices keep yours useful." },
      { h2: "Ship updates in plain language", p: "Lead with the benefit, not the implementation. 'Dark mode is here' beats 'refactored theme provider'." },
      { h2: "Categorise: New, Improved, Fixed", p: "A simple label helps readers scan and signals momentum across all three categories." },
      { h2: "Link releases to requests", p: "When a release answers a feature request, link them. It shows users their feedback drives the product — and it's the core of closing the feedback loop." },
      { h2: "Offer RSS and a widget", p: "Let users subscribe via RSS or an in-app 'what's new' widget so updates reach them where they already are." },
    ],
  },
  {
    slug: "close-the-feedback-loop",
    title: "How to close the customer feedback loop",
    description:
      "Closing the feedback loop turns one-off requests into loyalty. Here's a repeatable system: collect, prioritise, build, and tell the people who asked.",
    date: "2026-06-13",
    keyword: "customer feedback loop",
    readMins: 5,
    blocks: [
      { p: "Collecting feedback is easy. Closing the loop — telling people you acted on it — is where trust is built. Here's how." },
      { h2: "The four stages", ul: ["Collect requests on a public board", "Prioritise with votes", "Build and move to a roadmap", "Tell the people who asked when it ships"] },
      { h2: "Why the last step matters most", p: "Users who hear 'you asked, we shipped' become advocates. Skipping it makes feedback feel like a black hole." },
      { h2: "Automate it", p: "Feedlark closes the loop automatically: ship a roadmap item and it writes the changelog and notifies every voter, badging their original request as Shipped." },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
