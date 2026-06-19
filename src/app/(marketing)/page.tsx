import { ArrowRight, Check, X, Infinity as InfinityIcon } from "lucide-react";
import { LinkButton } from "@/components/ui";
import { JsonLd, faqJsonLd, softwareAppJsonLd } from "@/components/json-ld";
import { BrowserFrame, BoardMockup, RoadmapMockup, ChangelogMockup, WidgetMockup, LoopDemo } from "@/components/marketing/mockups";
import { FeatureRow } from "@/components/marketing/home/feature-row";
import { HOME_FAQS } from "@/lib/content/faqs";

export default function HomePage() {
  return (
    <>
      <JsonLd data={[softwareAppJsonLd(), faqJsonLd(HOME_FAQS)]} />

      {/* Hero */}
      <section className="grain relative overflow-hidden border-b border-sand-200 bg-paper">
        <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
        <div className="absolute inset-0 glow-brand" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 py-16 md:py-24 lg:grid-cols-[1.05fr_1fr]">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-sand-200 bg-white/70 px-3 py-1 text-[13px] font-medium text-ink-soft shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-spruce-500" /> The feedback tool that never charges per voter
            </span>
            <h1 className="mt-6 font-display text-[2.7rem] font-semibold leading-[1.02] tracking-tightest text-ink text-balance md:text-6xl">
              Turn customer feedback into a roadmap they can <span className="italic text-brand-600">watch you ship</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft text-pretty">
              Collect feature requests, prioritise a public roadmap, and publish a changelog in one place.
              Unlimited end users, posts and votes. Your 26th user is free. So is your 26,000th.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/signup" size="lg">
                Start free, no card <ArrowRight className="h-4 w-4" />
              </LinkButton>
              <LinkButton href="/feedback" variant="outline" size="lg">
                Try a live board
              </LinkButton>
            </div>
            <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-muted">
              <span>Unlimited voters</span> <span className="text-sand-300">·</span>
              <span>Public roadmap</span> <span className="text-sand-300">·</span>
              <span>Changelog + widget</span> <span className="text-sand-300">·</span>
              <span>Live in two minutes</span>
            </p>
          </div>
          <div className="relative animate-fade-up [animation-delay:120ms]">
            <BrowserFrame>
              <BoardMockup />
            </BrowserFrame>
            <div className="absolute -bottom-5 -left-5 hidden rotate-[-4deg] rounded-xl border border-sand-200 bg-white px-3 py-2 text-xs font-medium text-ink shadow-lift sm:block">
              <span className="text-brand-600">↑ click a vote.</span> It&apos;s really interactive
            </div>
          </div>
        </div>
      </section>

      {/* The honest math */}
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto grid max-w-5xl gap-px overflow-hidden rounded-none sm:grid-cols-3">
          {[
            { big: <InfinityIcon className="h-7 w-7" />, label: "End users, votes & posts", sub: "On every plan, forever" },
            { big: "$0", label: "To run a full board", sub: "Pro is per seat, never per voter" },
            { big: "2 min", label: "From sign-up to live", sub: "Share a link or embed the widget" },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1 px-6 py-10 text-center">
              <div className="font-display text-4xl font-semibold text-brand-600">{s.big}</div>
              <p className="mt-1 font-medium text-ink">{s.label}</p>
              <p className="text-sm text-ink-muted">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Growth-tax comparison */}
      <section className="bg-paper">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tightest text-ink md:text-4xl">The growth tax, gone</h2>
            <p className="mt-3 text-ink-soft">Most feedback tools bill by how many users engage. The more your product works, the more you pay. We think that&apos;s backwards.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-sand-200 bg-white p-7">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">The usual way</h3>
              <p className="mt-2 font-display text-2xl font-semibold text-ink">Pay more as more people care</p>
              <ul className="mt-5 space-y-3 text-sm text-ink-soft">
                {["Free plan caps at 25 tracked users", "Per-tracked-user billing on every voter", "$79 climbing past $660 a month as you grow", "Voters must make an account before they post"].map((t) => (
                  <li key={t} className="flex gap-2.5"><X className="mt-0.5 h-4 w-4 shrink-0 text-red-400" /> {t}</li>
                ))}
              </ul>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-b from-brand-50/80 to-white p-7 shadow-soft">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-700">The Feedlark way</h3>
              <p className="mt-2 font-display text-2xl font-semibold text-ink">Grow all you want, free</p>
              <ul className="mt-5 space-y-3 text-sm text-ink-soft">
                {["Unlimited end users, forever", "Unlimited posts, votes, comments and boards", "Optional Pro at $19 per admin seat, never per voter", "One-click voting, no account required"].map((t) => (
                  <li key={t} className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-spruce-600" /> {t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* The loop (signature interactive) */}
      <section id="features" className="border-y border-sand-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">The closed loop</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tightest text-ink md:text-[2.6rem] md:leading-[1.06]">
                Ship it once. Three things update <span className="italic text-brand-600">on their own</span>.
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
                When a request is done, you press one button. The roadmap moves it to Shipped, the changelog
                writes the entry, and every person who voted hears about it. Try it.
              </p>
            </div>
            <LoopDemo />
          </div>
        </div>
      </section>

      {/* Feature rows with live mockups */}
      <section className="bg-paper">
        <div className="mx-auto max-w-6xl space-y-24 px-4 py-24">
          <FeatureRow
            eyebrow="Feedback boards"
            title={<>Every idea, ranked by the people who want it</>}
            body="Public boards where customers post ideas, upvote with one click and discuss. No login wall, so you hear from everyone, not just the few who sign up."
            points={["One-click voting, no account needed", "Comments and a team reply on every post", "Sorted by votes so priorities are obvious"]}
            visual={<BrowserFrame url="acme.feedlark.app/feedback"><BoardMockup /></BrowserFrame>}
          />
          <FeatureRow
            flip
            eyebrow="Public roadmap"
            title={<>A roadmap that keeps itself current</>}
            body="Planned, In progress and Shipped columns build themselves from the statuses you set on posts. Customers always see exactly where their request stands."
            points={["Three live columns, zero manual upkeep", "Each card links back to the original request", "Machine-readable so AI assistants can read it too"]}
            visual={<RoadmapMockup />}
          />
          <FeatureRow
            eyebrow="Changelog + widget"
            title={<>Announce what&apos;s new, everywhere it matters</>}
            body="A hosted changelog with an RSS feed and an embeddable 'what's new' widget. Drop the feedback widget on any page and collect ideas without sending people away."
            points={["Hosted changelog page and RSS feed", "Embeddable feedback widget for any site", "Your brand colour, your domain on Pro"]}
            visual={
              <div className="grid gap-4 sm:grid-cols-2">
                <ChangelogMockup />
                <WidgetMockup />
              </div>
            }
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-sand-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <h2 className="text-center font-display text-3xl font-semibold tracking-tightest text-ink">Questions, answered</h2>
          <dl className="mt-10 divide-y divide-sand-200">
            {HOME_FAQS.map((f) => (
              <div key={f.q} className="py-6">
                <dt className="font-semibold text-ink">{f.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink-soft">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-ink">
        <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(50% 60% at 50% 0%, rgba(242,106,24,0.5), transparent 70%)" }} aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tightest text-white md:text-4xl">Start collecting feedback in two minutes</h2>
          <p className="mt-4 text-cream/80">Free forever for unlimited users. No credit card. No growth tax.</p>
          <div className="mt-8 flex justify-center">
            <LinkButton href="/signup" size="lg">Create your free board <ArrowRight className="h-4 w-4" /></LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}
