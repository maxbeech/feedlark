import { ArrowRight, Check, MessageSquare, Map, Megaphone, Sparkles, X } from "lucide-react";
import { LinkButton } from "@/components/ui";
import { JsonLd, faqJsonLd, softwareAppJsonLd } from "@/components/json-ld";
import { BoardPreview } from "@/components/marketing/board-preview";
import { HOME_FAQS } from "@/lib/content/faqs";

export default function HomePage() {
  return (
    <>
      <JsonLd data={[softwareAppJsonLd(), faqJsonLd(HOME_FAQS)]} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-dotted">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:py-24 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
              <Sparkles className="h-4 w-4" /> The free Canny alternative — no growth tax
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-ink md:text-5xl lg:text-6xl">
              Customer feedback that doesn&apos;t <span className="text-brand-600">tax your growth</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-soft">
              Collect feature requests, prioritise a public roadmap and ship a changelog — in one place.
              Unlimited end-users, posts and votes. <strong className="text-ink">Free forever.</strong> Your 26th
              user is free. Your 26,000th user is free.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/signup" size="lg">
                Start free — no card <ArrowRight className="h-4 w-4" />
              </LinkButton>
              <LinkButton href="/feedback" variant="outline" size="lg">
                See a live board
              </LinkButton>
            </div>
            <p className="mt-4 text-sm text-ink-muted">
              Unlimited voters · Public roadmap · Changelog + widget · Set up in 2 minutes
            </p>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-brand-100/60 to-transparent blur-2xl" />
            <BoardPreview />
          </div>
        </div>
      </section>

      {/* Growth-tax comparison strip */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-12 md:grid-cols-2">
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-red-700">The old way</h2>
            <p className="mt-2 text-xl font-semibold text-ink">Pay more as more users engage</p>
            <ul className="mt-4 space-y-2 text-sm text-ink-soft">
              {["Free plan caps at 25 tracked users", "Per-tracked-user billing — every voter adds cost", "$79 → $660+/mo as you grow", "Voters must create an account to post"].map((t) => (
                <li key={t} className="flex gap-2"><X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" /> {t}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">The Feedlark way</h2>
            <p className="mt-2 text-xl font-semibold text-ink">Grow as much as you want, free</p>
            <ul className="mt-4 space-y-2 text-sm text-ink-soft">
              {["Unlimited end-users, forever", "Unlimited posts, votes, comments & boards", "Optional Pro is $19 per admin seat — never per voter", "One-click voting, no account required"].map((t) => (
                <li key={t} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {t}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink">Everything you need to close the loop</h2>
          <p className="mt-3 text-ink-soft">Capture what users want, show them what&apos;s coming, and tell them when it ships.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: MessageSquare, title: "Feedback boards", body: "Public boards where users post ideas, upvote and comment. Sort by votes to see what matters most." },
            { icon: Map, title: "Public roadmap", body: "Planned → In Progress → Shipped, built automatically from your post statuses. Always up to date." },
            { icon: Megaphone, title: "Changelog + widget", body: "Announce releases with a hosted changelog, RSS feed and an embeddable 'what's new' widget." },
            { icon: Sparkles, title: "You asked → We shipped", body: "Ship a roadmap item and Feedlark auto-writes the changelog and notifies everyone who voted. Loop closed." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-200 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <h2 className="text-center text-3xl font-bold tracking-tight text-ink">Live in three steps</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { n: "1", t: "Create your board", d: "Sign up free and get a public board at feedlark.app/b/your-team in seconds." },
              { n: "2", t: "Collect & prioritise", d: "Share the link or embed the widget. Users post and vote; you set statuses to build the roadmap." },
              { n: "3", t: "Ship & close the loop", d: "Mark items Shipped — the changelog writes itself and every voter gets the good news." },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">{s.n}</div>
                <h3 className="mt-4 font-semibold text-ink">{s.t}</h3>
                <p className="mt-2 text-sm text-ink-soft">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight text-ink">Frequently asked questions</h2>
        <dl className="mt-10 divide-y divide-slate-200">
          {HOME_FAQS.map((f) => (
            <div key={f.q} className="py-5">
              <dt className="font-semibold text-ink">{f.q}</dt>
              <dd className="mt-2 text-sm leading-6 text-ink-soft">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Final CTA */}
      <section className="bg-ink">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">Start collecting feedback in 2 minutes</h2>
          <p className="mt-3 text-slate-300">Free forever for unlimited users. No credit card. No growth tax.</p>
          <div className="mt-8"><LinkButton href="/signup" size="lg">Create your free board <ArrowRight className="h-4 w-4" /></LinkButton></div>
        </div>
      </section>
    </>
  );
}
