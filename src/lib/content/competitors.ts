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
  /** A practical, product-specific decision note, not generic comparison copy. */
  evaluation: string;
  pricingSource: string;
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
    evaluation: "Choose Canny when its captured-feedback integrations and reporting are central to how your product team works. Choose Feedlark when you want a public board that can invite broad participation without making the number of voters a budget decision. Before moving, list the integrations and fields your team actually uses, export a small representative set of posts, and test that the new board gives customers the same clear place to vote.",
    pricingSource: "https://canny.io/pricing",
  },
  {
    slug: "featurebase",
    name: "Featurebase",
    keyword: "featurebase alternative",
    positioning:
      "Featurebase is a popular, well-priced feedback + support suite (boards, roadmap, changelog, help center, surveys).",
    pricing:
      "Featurebase's current plans include Free (one admin seat), Growth, Professional and Enterprise. Paid annual seats start at $29, and some AI, email and translation use is metered separately.",
    mainGripe:
      "The free plan withholds AI and several features, and per-seat plus per-AI-resolution add-ons get expensive as teams add languages, seats or automation.",
    rows: [
      ["Free plan", "Unlimited end-users, one admin seat", "Unlimited end-users"],
      ["Entry paid price", "$29/seat/mo", "$19/seat/mo"],
      ["Auto-notify voters on ship", "Changelog popups", "Automatic per-voter notify + 'Shipped' badge"],
      ["SEO/GEO public pages", "Yes", "Yes (+ llms.txt, structured data)"],
      ["Simplicity", "Broad support suite", "Focused on feedback → roadmap → changelog"],
    ],
    faqs: [
      { q: "Feedlark vs Featurebase: what's the difference?", a: "Both give unlimited end-users on free. Feedlark is more focused (feedback, roadmap, changelog) and a little cheaper at $19/seat, and it auto-closes the loop by notifying everyone who voted when an item ships." },
      { q: "Is Feedlark cheaper than Featurebase?", a: "Feedlark's paid plan starts at $19 per admin seat vs Featurebase's $29, and Feedlark doesn't meter AI as a per-resolution add-on." },
    ],
    evaluation: "Featurebase is the stronger fit if you want support, surveys, a help centre and product feedback under one roof. Feedlark is for a team that wants the feedback loop to stay small and legible: collect requests, show a roadmap, then publish what shipped. The useful comparison is not a feature checklist. Ask which parts of the suite your team opens every week, and whether a focused public board would make the customer-facing part easier to maintain.",
    pricingSource: "https://help.featurebase.app/en/help/articles/7608294-featurebase-pricing-explained",
  },
  {
    slug: "productboard",
    name: "Productboard",
    keyword: "productboard alternative",
    positioning:
      "Productboard is an enterprise product-management platform (insights, prioritisation, strategy and roadmaps).",
    pricing:
      "Productboard has a free plan with limits on feedback notes and contributors. Plus starts at $19 per maker each month on annual billing, while the platform also uses AI credits.",
    mainGripe:
      "It's built for big product orgs. For collecting feature requests and showing a public roadmap, it's overkill and expensive.",
    rows: [
      ["Best for", "Enterprise PM teams", "Any team that wants user feedback"],
      ["Setup", "Heavy", "Live in 2 minutes"],
      ["Free plan", "Free with limits on notes and contributors", "Free forever, unlimited users"],
      ["Public board + voting", "Add-on / portal", "Core, included free"],
    ],
    faqs: [
      { q: "Is there a simpler Productboard alternative?", a: "Yes. If you mainly need a public feedback board, voting, a roadmap and a changelog, Feedlark does exactly that for free, without the enterprise complexity." },
    ],
    evaluation: "Productboard earns its place when a product organisation needs to connect discovery, prioritisation, documents and strategy across several makers. Feedlark is a better fit when the immediate job is public listening and visible delivery. A practical test is to name the decision you need to make this week. If it is portfolio planning, Productboard may be worth the setup. If it is giving customers one honest answer about what is being considered and shipped, a simpler board is usually easier to keep current.",
    pricingSource: "https://www.productboard.com/pricing/",
  },
  {
    slug: "nolt",
    name: "Nolt",
    keyword: "nolt alternative",
    positioning: "Nolt is a beautifully simple, well-designed feedback board.",
    pricing: "Nolt's annual Essential plan is $29/month for one board, while Pro is $69/month for five boards. There is a 10-day trial rather than a free ongoing plan.",
    mainGripe: "There is no free ongoing plan, and the plan limits on boards matter for teams that need a separate space for each product or client.",
    rows: [
      ["Free plan", "Trial only", "Free forever"],
      ["Pricing", "$29/mo annual for one board", "Unlimited boards free; $19/seat for Pro extras"],
      ["Changelog", "Limited", "Built-in + RSS + widget"],
      ["Roadmap", "Yes", "Yes"],
    ],
    faqs: [
      { q: "Is there a free Nolt alternative?", a: "Yes. Feedlark offers unlimited boards and users free, plus a changelog and roadmap Nolt charges extra for." },
    ],
    evaluation: "Nolt is a sensible choice for a team that values a tidy, established feedback portal and knows exactly how many boards it needs. Feedlark is worth considering when a new board should be a low-friction decision, especially for agencies or multi-product teams. Start with the shape of your feedback rather than a feature count: one shared community can work well in a single board; separate audiences and release cycles usually need separate, clearly owned spaces.",
    pricingSource: "https://nolt.io/pricing",
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
    evaluation: "Frill is a good candidate when surveys and a broader announcement workflow are part of the same customer programme. Feedlark is designed for the narrower but common loop of ideas, votes, roadmap status and the follow-up when work ships. Put a real request through both products before committing: check how a customer submits it, how your team explains its status, and what that customer receives once it is complete.",
    pricingSource: "https://frill.co/pricing",
  },
];

export function getCompetitor(slug: string): Competitor | undefined {
  return COMPETITORS.find((c) => c.slug === slug);
}
