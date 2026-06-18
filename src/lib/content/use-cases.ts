export interface UseCase {
  slug: string;
  audience: string;
  title: string;
  intro: string;
  pains: string[];
  wins: string[];
  keyword: string;
}

export const USE_CASES: UseCase[] = [
  {
    slug: "saas",
    audience: "SaaS teams",
    title: "Customer feedback software for SaaS",
    keyword: "customer feedback tool for saas",
    intro: "Turn scattered feature requests from support, sales and Slack into one prioritised, public roadmap — and tell customers when you ship.",
    pains: ["Requests buried across Intercom, email and Slack", "No transparent roadmap, so customers keep asking 'when?'", "Feedback tools that charge more as your user base grows"],
    wins: ["One public board your whole user base can vote on", "A live roadmap that answers 'what's next' automatically", "Unlimited users free — your growth never raises the bill"],
  },
  {
    slug: "indie-hackers",
    audience: "indie hackers",
    title: "Free feedback board for indie hackers",
    keyword: "free feedback board for indie hackers",
    intro: "Ship in public, let users vote on what's next, and prove momentum with a changelog — without paying enterprise prices on day one.",
    pains: ["Most feedback tools aren't free past a tiny user cap", "Building a feedback board yourself is a side-quest", "Hard to show momentum to early users"],
    wins: ["Free forever for unlimited users", "Set up a board in two minutes", "Auto-changelog every time you ship a requested feature"],
  },
  {
    slug: "startups",
    audience: "startups",
    title: "Product feedback & roadmap tool for startups",
    keyword: "product roadmap tool for startups",
    intro: "Centralise customer feedback, prioritise with votes, and keep users in the loop as you move fast — all on a budget.",
    pains: ["Limited budget for per-seat, per-user PM tools", "Customers feel ignored when requests vanish", "No single source of truth for what to build next"],
    wins: ["Flat, predictable pricing ($19/seat, never per voter)", "Public roadmap builds trust with early customers", "Close the loop automatically when you ship"],
  },
  {
    slug: "mobile-apps",
    audience: "mobile apps",
    title: "In-app feedback & changelog for mobile apps",
    keyword: "in app feedback tool",
    intro: "Collect feature requests in-app, show a public roadmap, and announce updates with a 'what's new' changelog your users actually read.",
    pains: ["App-store reviews are a terrible feedback channel", "No easy way to show users what's coming", "Update notes nobody sees"],
    wins: ["Embeddable widget for in-app feedback", "Public roadmap users can vote on", "Hosted changelog with RSS for release notes"],
  },
  {
    slug: "agencies",
    audience: "agencies",
    title: "Client feedback boards for agencies",
    keyword: "client feedback tool",
    intro: "Give each client a branded board to collect and prioritise requests — with unlimited boards so you never pay per project.",
    pains: ["Per-board pricing punishes agencies with many clients", "Client requests scattered across email threads", "No clean way to show progress"],
    wins: ["Unlimited boards, free", "A clear roadmap per client", "Custom domain & white-label on Pro"],
  },
];

export function getUseCase(slug: string): UseCase | undefined {
  return USE_CASES.find((u) => u.slug === slug);
}
