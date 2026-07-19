import type { BlogPost } from "./blog-types";

export const BLOG_CLIENT_FEEDBACK: BlogPost[] = [
  {
    slug: "client-feedback-tools-for-agencies",
    title: "Client feedback tools: what agencies actually need",
    description:
      "Client feedback tools for agencies and freelancers compared: what to look for, common mistakes, and a free option with no per-client seat cost.",
    date: "2026-07-16",
    keyword: "client feedback tools",
    category: "Reviews",
    author: "Feedlark Team",
    schemaType: "Review",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080",
    imageAlt: "Agency team member gesturing during a client meeting while reviewing feedback on a laptop",
    readMins: 9,
    takeaways: [
      "Client feedback tools built for agencies differ from internal product feedback boards mainly in one thing: per-client isolation.",
      "The biggest hidden cost is per-seat or per-client pricing, which punishes agencies precisely as they grow.",
      "A shared board with private client views, rather than a separate tool per account, scales better past five or six clients.",
      "Look for revision request tracking, not just general comments, if you run design or dev retainers.",
    ],
    blocks: [
      { p: "Running client work through a shared inbox or a scattered mix of email threads and PDF markups falls apart fast once an agency passes three or four active accounts. Client feedback tools exist to fix this: a structured place where each client can leave input, see what is planned, and get notified when something ships, without that client seeing another client's requests sitting next to theirs. The trouble is most tools built for this were designed around per-user or per-client pricing, which is exactly the wrong model for an agency adding accounts every quarter." },
      { h2: "What makes agency client feedback different from product feedback", p: "A SaaS company collecting feedback from its own users has one entity to manage: the product. An agency managing feedback across ten client accounts effectively runs ten separate feedback relationships in parallel, each with different stakeholders, different priorities and, critically, a hard requirement that Client A never sees Client B's requests, pricing, or internal notes. Generic feedback tools built for a single product rarely handle that isolation cleanly, it is usually bolted on as an enterprise-tier feature, if it exists at all." },
      { h2: "The core features to check before signing up", ul: [
        "Private or client-scoped boards, so each account only sees its own submissions, not a shared public list",
        "Status tracking beyond 'open' and 'closed' — planned, in progress, shipped at minimum, so clients can see genuine progress",
        "Voting or prioritisation on individual boards, useful when a single client has many stakeholders submitting overlapping requests",
        "Automatic notification when a request's status changes, so the agency is not manually emailing every client on every update",
        "No per-client or per-seat pricing tier that punishes growth, since the whole point is scaling across more accounts over time",
      ] },
      { table: { caption: "Typical client feedback tool pricing models and what they mean at scale", head: ["Pricing model", "Cost at 5 clients", "Cost at 20 clients"], rows: [
        ["Per-client seat (e.g. $15/client/mo)", "$75/mo", "$300/mo"],
        ["Per-team-seat, unlimited clients", "Fixed regardless of client count", "Fixed regardless of client count"],
        ["Free tier with unlimited boards", "$0", "$0"],
      ] } },
      { h2: "Why per-client pricing is the wrong incentive", p: "Charging by the client means the tool gets more expensive exactly as the agency succeeds at winning new accounts, which is a strange incentive to build into a piece of internal infrastructure. A five-person studio landing a sixth client should not need to re-evaluate its feedback tooling budget on the strength of one new signed contract. Tools priced per team seat, or genuinely free ones with unlimited boards, remove that friction entirely and let the agency add accounts without a spreadsheet conversation first." },
      { quote: { text: "We switched off a per-client tool the month our eleventh account signed and the invoice jumped by sixty percent overnight. The work hadn't changed, only the pricing model had caught up with our growth.", cite: "Marcus Webb, Founder at a UK-based product design studio" } },
      { h2: "Revision tracking versus open-ended comments", p: "Design and development retainers generate a specific kind of feedback: a numbered round of revisions against a specific deliverable, not an open-ended stream of ideas. If most of your client work runs on structured revision rounds rather than ongoing feature requests, check whether a tool supports threaded requests tied to a version or milestone, not just a flat list of comments. A general feedback board works well for ongoing product retainers; it works less well for a fixed six-week design sprint where round 2 needs to reference round 1 directly." },
      { h2: "Setting client expectations from day one", p: "The tool only works if clients actually use it instead of reverting to email the moment something feels urgent. Set the expectation in the kickoff call: all feedback goes through the board, email is for anything genuinely time-sensitive. Pin a short how-to note at the top of each client's board on day one, three sentences on how to submit a request and how status updates work, and revisit it if a client starts drifting back to email threads a few weeks in." },
      { h2: "A short example from a two-person studio", p: "A small brand design studio we spoke with ran client revisions entirely through email for its first two years, tracking status in a personal notebook. By the fourth active client, requests started slipping through, one client waited three weeks for a revision that had actually been sitting finished, unshared, because the update never made it out of an inbox. Moving to a shared board with per-client views did not add new capacity, but it made every open request visible in one place, which alone cut their average response time roughly in half within the first month." },
      { h2: "Common mistakes agencies make with client feedback tools", ul: [
        "Buying a per-client-seat tool early, before checking what it will cost once the client roster doubles",
        "Using one shared board for every client, breaking the isolation clients expect from a paid vendor relationship",
        "Skipping the client-facing onboarding note, so half the account still emails requests instead of using the board",
        "Treating the tool as a replacement for a kickoff conversation about scope, rather than a status-tracking layer on top of it",
      ] },
      { h2: "How this fits into a wider workflow", p: "A client feedback tool works best as one piece of a broader loop: collect the request, track its status, and [close the loop by notifying the client once it ships](/blog/close-the-feedback-loop) rather than leaving them to check back manually. Agencies that treat the board as a live status page, not a one-way submission form, get noticeably fewer 'any update on this?' emails from clients checking in out of uncertainty rather than genuine urgency." },
    ],
    faqs: [
      { q: "Do client feedback tools need to be different from internal feedback boards?", a: "The core mechanics are similar, but agencies need per-client isolation so different accounts cannot see each other's requests, which most single-product feedback tools do not build in by default." },
      { q: "Is per-client pricing normal for these tools?", a: "It is common but works against agencies specifically, since the tool gets more expensive exactly as the agency wins more business. A flat team-seat or free unlimited-boards model avoids that." },
      { q: "How do I get clients to actually use the board instead of email?", a: "Set the expectation in the kickoff call, pin a short how-to note on their board, and gently redirect the first few emailed requests back to the board rather than answering them directly there." },
      { q: "What is the minimum feature set worth paying for?", a: "Private per-client boards, clear status tracking beyond open/closed, and automatic notifications on status change cover most agency use cases without needing a heavier enterprise tool." },
    ],
  },
];
