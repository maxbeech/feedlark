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
      <h1 className="text-4xl font-extrabold tracking-tight text-ink">About Feedlark</h1>
      <div className="prose-feedlark mt-6">
        <p>Feedlark exists because of one frustration: the leading feedback tools charge you more as more of your users engage. Hit a few dozen voters and you&apos;re asked to pay; grow and the bill climbs into the hundreds. That&apos;s a tax on the exact behaviour you want to encourage.</p>
        <p>So we built the opposite. Feedlark gives you feedback boards, a public roadmap and a changelog with <strong>unlimited end-users — free, forever.</strong> If you ever want brand and team extras, you pay a flat rate per admin seat, never per voter.</p>
        <h2>What we believe</h2>
        <ul>
          <li>Listening to users should be free.</li>
          <li>Voting shouldn&apos;t require a login.</li>
          <li>When you ship something, the people who asked should hear about it — automatically.</li>
        </ul>
        <p>That last one is why we&apos;re called Feedlark: every shipped feature closes the loop back to the people who wanted it.</p>
      </div>
      <div className="mt-8"><LinkButton href="/signup" size="lg">Start free</LinkButton></div>
    </section>
  );
}
