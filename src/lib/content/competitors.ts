export interface Competitor {
  slug: string;
  name: string;
  /** One-line factual positioning. */
  positioning: string;
  /** Verified pricing summary (research 2026-06). */
  pricing: string;
  /** The core grievance Feedlark answers. */
  mainGripe: string;
  /** Honest comparison rows: [dimension, them, Feedlark]. */
  rows: [string, string, string][];
  faqs: { q: string; a: string }[];
  keyword: string;
}

export const COMPETITORS: Competitor[] = [
  {
    slug: "canny",
    name: "Canny",
    keyword: "canny alternative",
    positioning:
      "Canny is the category-defining customer feedback tool: boards, roadmap, changelog and a widget, with deep integrations.",
    pricing:
      "Canny's free plan caps at 25 tracked users and it bills per tracked user, so every voter and commenter adds to your bill. Paid plans start around $79/mo (billed yearly) and scale steeply with your user count.",
    mainGripe:
      "Per-tracked-user pricing is a growth tax: the more your feedback board succeeds, the more you pay. In 2025 Canny moved everyone to this model and retired its old generous free plan.",
    rows: [
      ["Free plan", "Capped at 25 tracked users", "Unlimited end-users, forever"],
      ["Billing unit", "Per tracked user (every voter counts)", "Per admin seat only ($19/mo)"],
      ["Voting", "Account/login often required", "One click, no login"],
      ["Boards & posts", "Unlimited", "Unlimited"],
      ["Public roadmap & changelog", "Yes", "Yes"],
      ["Auto-notify voters on ship", "Manual", "Automatic ('You asked → We shipped')"],
    ],
    faqs: [
      { q: "Is there a free Canny alternative?", a: "Yes. Feedlark's free plan includes unlimited end-users, posts, votes, boards, a public roadmap, changelog and widget. Canny's free plan caps at 25 tracked users." },
      { q: "Why is Canny so expensive?", a: "Canny bills per tracked user, so cost rises with engagement. Feedlark charges only per admin seat, so your bill never grows just because more people give feedback." },
      { q: "Can I migrate from Canny?", a: "Feedlark covers the same core workflow (boards, voting, roadmap and changelog), so you can recreate your setup and point your feedback link or widget at Feedlark." },
    ],
  },
  {
    slug: "featurebase",
    name: "Featurebase",
    keyword: "featurebase alternative",
    positioning:
      "Featurebase is a popular, well-priced feedback + support suite (boards, roadmap, changelog, help center, surveys).",
    pricing:
      "Featurebase has a free plan with unlimited end-users, then charges per admin seat ($29/$59/$99 per seat/mo billed yearly), with AI features metered as a paid add-on.",
    mainGripe:
      "The free plan withholds AI and several features, and per-seat plus per-AI-resolution add-ons get expensive as teams add languages, seats or automation.",
    rows: [
      ["Free plan", "Unlimited end-users (AI excluded)", "Unlimited end-users"],
      ["Entry paid price", "$29/seat/mo", "$19/seat/mo"],
      ["Auto-notify voters on ship", "Changelog popups", "Automatic per-voter notify + 'Shipped' badge"],
      ["SEO/GEO public pages", "Yes", "Yes (+ llms.txt, structured data)"],
      ["Simplicity", "Broad support suite", "Focused on feedback → roadmap → changelog"],
    ],
    faqs: [
      { q: "Feedlark vs Featurebase: what's the difference?", a: "Both give unlimited end-users on free. Feedlark is more focused (feedback, roadmap, changelog) and a little cheaper at $19/seat, and it auto-closes the loop by notifying everyone who voted when an item ships." },
      { q: "Is Feedlark cheaper than Featurebase?", a: "Feedlark's paid plan starts at $19 per admin seat vs Featurebase's $29, and Feedlark doesn't meter AI as a per-resolution add-on." },
    ],
  },
  {
    slug: "productboard",
    name: "Productboard",
    keyword: "productboard alternative",
    positioning:
      "Productboard is an enterprise product-management platform (insights, prioritisation, strategy and roadmaps).",
    pricing:
      "Productboard is priced per maker (around $19/maker/mo monthly) with AI on a credit system. It's powerful, but heavy and costly for small teams that just want a feedback board.",
    mainGripe:
      "It's built for big product orgs. For collecting feature requests and showing a public roadmap, it's overkill and expensive.",
    rows: [
      ["Best for", "Enterprise PM teams", "Any team that wants user feedback"],
      ["Setup", "Heavy", "Live in 2 minutes"],
      ["Free plan", "Limited / trial", "Free forever, unlimited users"],
      ["Public board + voting", "Add-on / portal", "Core, included free"],
    ],
    faqs: [
      { q: "Is there a simpler Productboard alternative?", a: "Yes. If you mainly need a public feedback board, voting, a roadmap and a changelog, Feedlark does exactly that for free, without the enterprise complexity." },
    ],
  },
  {
    slug: "nolt",
    name: "Nolt",
    keyword: "nolt alternative",
    positioning: "Nolt is a beautifully simple, well-designed feedback board.",
    pricing: "Nolt is a flat ~$29/mo per board, but lacks an API, AI and some integrations like Jira.",
    mainGripe: "No free plan for ongoing use, per-board pricing, and missing API/integrations as you scale.",
    rows: [
      ["Free plan", "Trial only", "Free forever"],
      ["Pricing", "~$29/mo per board", "Unlimited boards free; $19/seat for Pro extras"],
      ["Changelog", "Limited", "Built-in + RSS + widget"],
      ["Roadmap", "Yes", "Yes"],
    ],
    faqs: [
      { q: "Is there a free Nolt alternative?", a: "Yes. Feedlark offers unlimited boards and users free, plus a changelog and roadmap Nolt charges extra for." },
    ],
  },
  {
    slug: "frill",
    name: "Frill",
    keyword: "frill alternative",
    positioning: "Frill is a clean Canny alternative bundling ideas, roadmap and announcements.",
    pricing: "Frill starts around $25/mo (Startup) and rises to $49/mo and $149/mo for unlimited ideas and white-label.",
    mainGripe: "No genuinely free ongoing plan, and white-label/surveys are gated behind the $149/mo tier.",
    rows: [
      ["Free plan", "Trial only", "Free forever, unlimited users"],
      ["Entry price", "~$25/mo", "Free (Pro $19/seat)"],
      ["Remove branding", "$149/mo tier", "$19/seat Pro"],
      ["Auto-notify voters on ship", "Manual announcements", "Automatic 'You asked → We shipped'"],
    ],
    faqs: [
      { q: "Is Feedlark a good Frill alternative?", a: "Yes. Feedlark covers ideas, roadmap and changelog like Frill, but it's free for unlimited users and auto-notifies voters when their request ships." },
    ],
  },
];

export function getCompetitor(slug: string): Competitor | undefined {
  return COMPETITORS.find((c) => c.slug === slug);
}
