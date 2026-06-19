import type { Metadata } from "next";
import { LinkButton } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Feedlark",
  description: "Feedlark is a free customer feedback tool built on a simple belief: you shouldn't pay more just because more people give you feedback.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Our story</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tightest text-ink md:text-5xl">Listening shouldn&apos;t cost more as you grow</h1>
      <div className="prose-feedlark mt-8">
        <p>Feedlark started with one frustration. The leading feedback tools charge you more as more of your users engage. Hit a few dozen voters and you are asked to pay. Grow, and the bill climbs into the hundreds. That is a tax on the exact behaviour you want to encourage.</p>
        <p>So we built the opposite. Feedlark gives you feedback boards, a public roadmap and a changelog with <strong>unlimited end users, free forever.</strong> If you ever want brand and team extras, you pay a flat rate per admin seat, never per voter.</p>
        <h2>What we believe</h2>
        <ul>
          <li>Listening to your users should be free.</li>
          <li>Voting should never require a login.</li>
          <li>When you ship something, the people who asked for it should hear about it automatically.</li>
        </ul>
        <p>That last one is the reason for the name. A lark sings to announce the morning. Every feature you ship sends the good news back to the people who wanted it, and the loop closes.</p>
      </div>
      <div className="mt-8"><LinkButton href="/signup" size="lg">Start free</LinkButton></div>
    </section>
  );
}
