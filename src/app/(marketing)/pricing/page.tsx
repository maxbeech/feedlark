import type { Metadata } from "next";
import { Check } from "lucide-react";
import { LinkButton } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";
import { JsonLd, faqJsonLd } from "@/components/json-ld";
import { PRO_PRICE_MONTHLY } from "@/lib/plans";

export const metadata: Metadata = pageMetadata({
  title: "Pricing — free forever, no growth tax",
  description: "Feedlark is free for unlimited end-users, posts and boards. Optional Pro is a flat $19 per admin seat — never per voter.",
  path: "/pricing",
});

const free = ["Unlimited end-users (voters)", "Unlimited posts, votes & comments", "Unlimited boards", "Public roadmap", "Changelog + RSS + widget", "'You asked → We shipped' notifications"];
const pro = ["Everything in Free", "Remove Feedlark branding", "Custom domain", "Private boards", "Smart duplicate detection", "Up to 10 admin seats"];

const faqs = [
  { q: "Is the free plan really unlimited?", a: "Yes. Unlimited end-users, posts, votes, comments and boards on the free plan — forever. We never charge per voter." },
  { q: "How much is Pro?", a: `Pro is $${PRO_PRICE_MONTHLY} per admin seat per month — a flat rate that doesn't change as more people use your boards.` },
  { q: "Do I need a credit card to start?", a: "No. Sign up and start collecting feedback in minutes with no card required." },
];

export default function PricingPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-ink">Simple pricing. No growth tax.</h1>
          <p className="mx-auto mt-3 max-w-xl text-ink-soft">Free for unlimited users. Upgrade only for team and brand features — billed per admin seat, never per voter.</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-7">
            <h2 className="text-lg font-semibold text-ink">Free</h2>
            <p className="mt-1 text-4xl font-extrabold text-ink">$0<span className="text-base font-medium text-ink-muted">/forever</span></p>
            <p className="mt-1 text-sm text-ink-muted">For unlimited users.</p>
            <ul className="mt-5 space-y-2 text-sm text-ink-soft">
              {free.map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {f}</li>)}
            </ul>
            <LinkButton href="/signup" className="mt-6 w-full">Start free</LinkButton>
          </div>

          <div className="rounded-2xl border-2 border-brand-500 bg-white p-7 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">Pro</h2>
              <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700">Most popular</span>
            </div>
            <p className="mt-1 text-4xl font-extrabold text-ink">${PRO_PRICE_MONTHLY}<span className="text-base font-medium text-ink-muted">/seat/mo</span></p>
            <p className="mt-1 text-sm text-ink-muted">Per admin seat. Voters always free.</p>
            <ul className="mt-5 space-y-2 text-sm text-ink-soft">
              {pro.map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> {f}</li>)}
            </ul>
            <LinkButton href="/signup" className="mt-6 w-full">Start free, upgrade later</LinkButton>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-2xl">
          <h2 className="text-center text-2xl font-bold text-ink">Pricing FAQ</h2>
          <dl className="mt-6 divide-y divide-slate-200">
            {faqs.map((f) => (
              <div key={f.q} className="py-4">
                <dt className="font-semibold text-ink">{f.q}</dt>
                <dd className="mt-1 text-sm text-ink-soft">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
