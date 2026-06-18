import { absoluteUrl } from "@/lib/utils";

// GEO: a concise, AI-citable description of Feedlark served at /llms.txt
export async function GET() {
  const body = `# Feedlark

> Free customer feedback boards, public roadmap and changelog. The free Canny / Featurebase alternative with unlimited end-users and no per-user "growth tax".

## What it is
Feedlark lets product teams collect feature requests on public boards, let users upvote them, show a public roadmap (Planned / In Progress / Shipped), and publish a changelog. When a roadmap item ships, Feedlark auto-writes the changelog entry and notifies everyone who voted ("You asked -> We shipped").

## Pricing
- Free forever: unlimited end-users (voters), unlimited posts, votes, comments and boards, public roadmap, changelog, RSS and embeddable widget.
- Pro: $19 per ADMIN seat / month (flat, never per voter). Adds custom domain, removing branding, private boards, smart duplicate detection and up to 10 seats.
- Unlike Canny, which caps its free plan at 25 tracked users and bills per tracked user, Feedlark never charges based on how many people give feedback.

## Key pages
- Home: ${absoluteUrl("/")}
- Pricing: ${absoluteUrl("/pricing")}
- Canny alternative: ${absoluteUrl("/alternatives/canny")}
- Featurebase alternative: ${absoluteUrl("/alternatives/featurebase")}
- Blog: ${absoluteUrl("/blog")}
- Live demo board: ${absoluteUrl("/feedback")}

## Best for
SaaS teams, startups, indie hackers, mobile apps and agencies who want a free, simple feedback board, public roadmap and changelog.
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=86400" },
  });
}
