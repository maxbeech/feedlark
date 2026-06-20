import type { Metadata } from "next";
import { Check, ArrowRight } from "lucide-react";
import { LinkButton } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";
import { JsonLd, faqJsonLd } from "@/components/json-ld";
import { PRO_PRICE_MONTHLY, PRO_FEATURES } from "@/lib/plans";

export const metadata: Metadata = pageMetadata({
  title: "Pricing: free forever, no growth tax",
  description: "Feedlark is free for unlimited end-users, posts and boards. Optional Pro is a flat $19 per admin seat, never per voter.",
  path: "/pricing",
});

const free = ["Unlimited end users (voters)", "Unlimited posts, votes and comments", "Unlimited boards", "Public roadmap", "Changelog, RSS feed and widget", "Automatic notify-on-ship"];
const pro = ["Everything in Free", ...PRO_FEATURES];

const faqs = [
  { q: "Is the free plan really unlimited?", a: "Yes. Unlimited end users, posts, votes, comments and boards on the free plan, forever. We never charge per voter." },
  { q: "How much is Pro?", a: `Pro is $${PRO_PRICE_MONTHLY} per admin seat per month. It is a flat rate that does not change as more people use your boards.` },
  { q: "What counts as an admin seat?", a: "Only your teammates who manage boards and reply to feedback. The customers who post and vote are always free, however many you have." },
  { q: "Do I need a credit card to start?", a: "No. Sign up and start collecting feedback in minutes with no card." },
];

export default function PricingPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <section className="grain relative overflow-hidden border-b border-sand-200 bg-paper">
        <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl px-4 py-16 md:py-20">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Pricing</p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tightest text-ink md:text-5xl">One price. No growth tax.</h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-ink-soft">Free for unlimited users. Upgrade only for team and brand features, billed per admin seat and never per voter.</p>
          </div>

          <div className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-sand-200 bg-white p-7 shadow-soft">
              <h2 className="font-display text-xl font-semibold text-ink">Free</h2>
              <p className="mt-2 font-display text-5xl font-semibold text-ink">$0<span className="font-sans text-base font-medium text-ink-muted">/forever</span></p>
              <p className="mt-1 text-sm text-ink-muted">For unlimited users.</p>
              <ul className="mt-6 space-y-2.5 text-sm text-ink-soft">
                {free.map((f) => <li key={f} className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-spruce-600" /> {f}</li>)}
              </ul>
              <LinkButton href="/signup" variant="outline" className="mt-7 w-full">Start free</LinkButton>
            </div>

            <div className="relative overflow-hidden rounded-2xl border-2 border-brand-300 bg-gradient-to-b from-brand-50/70 to-white p-7 shadow-lift">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold text-ink">Pro</h2>
                <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-medium text-white">Most popular</span>
              </div>
              <p className="mt-2 font-display text-5xl font-semibold text-ink">${PRO_PRICE_MONTHLY}<span className="font-sans text-base font-medium text-ink-muted">/seat/mo</span></p>
              <p className="mt-1 text-sm text-ink-muted">Per admin seat. Voters always free.</p>
              <ul className="mt-6 space-y-2.5 text-sm text-ink-soft">
                {pro.map((f) => <li key={f} className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> {f}</li>)}
              </ul>
              <LinkButton href="/signup" className="mt-7 w-full">Start free, upgrade later <ArrowRight className="h-4 w-4" /></LinkButton>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16">
          <h2 className="text-center font-display text-3xl font-semibold tracking-tightest text-ink">Pricing questions</h2>
          <dl className="mt-8 divide-y divide-sand-200">
            {faqs.map((f) => (
              <div key={f.q} className="py-5">
                <dt className="font-semibold text-ink">{f.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink-soft">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
