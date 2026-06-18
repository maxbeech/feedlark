import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, X, ArrowRight } from "lucide-react";
import { COMPETITORS, getCompetitor } from "@/lib/content/competitors";
import { LinkButton } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";
import { JsonLd, faqJsonLd } from "@/components/json-ld";

export function generateStaticParams() {
  return COMPETITORS.map((c) => ({ competitor: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ competitor: string }> }): Promise<Metadata> {
  const { competitor } = await params;
  const c = getCompetitor(competitor);
  if (!c) return {};
  return pageMetadata({
    title: `The free ${c.name} alternative`,
    description: `Feedlark is a free ${c.name} alternative: feedback boards, public roadmap and changelog with unlimited end-users and no per-user growth tax.`,
    path: `/alternatives/${c.slug}`,
  });
}

export default async function AlternativePage({ params }: { params: Promise<{ competitor: string }> }) {
  const { competitor } = await params;
  const c = getCompetitor(competitor);
  if (!c) notFound();

  return (
    <>
      <JsonLd data={faqJsonLd(c.faqs)} />
      <section className="bg-dotted">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
            The free <span className="text-brand-600">{c.name} alternative</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-soft">{c.positioning} Feedlark gives you the same essentials — for free, with unlimited end-users.</p>
          <div className="mt-7"><LinkButton href="/signup" size="lg">Start free <ArrowRight className="h-4 w-4" /></LinkButton></div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
          <h2 className="font-semibold text-amber-900">Why people look for a {c.name} alternative</h2>
          <p className="mt-2 text-amber-800">{c.mainGripe}</p>
          <p className="mt-2 text-sm text-amber-700">{c.name}&apos;s pricing today: {c.pricing}</p>
        </div>

        <h2 className="mt-12 text-2xl font-bold text-ink">{c.name} vs Feedlark</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-medium"></th>
                <th className="px-4 py-3 font-medium">{c.name}</th>
                <th className="px-4 py-3 font-semibold text-brand-700">Feedlark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {c.rows.map((r) => (
                <tr key={r[0]}>
                  <td className="px-4 py-3 font-medium text-ink">{r[0]}</td>
                  <td className="px-4 py-3 text-ink-soft">{r[1]}</td>
                  <td className="px-4 py-3 font-medium text-ink">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
            <h3 className="font-semibold text-emerald-800">What you get free with Feedlark</h3>
            <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
              {["Unlimited end-users & votes", "Unlimited boards & posts", "Public roadmap + changelog", "Embeddable widget", "Auto 'You asked → We shipped' notifications"].map((t) => (
                <li key={t} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {t}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-ink">What changes when you switch</h3>
            <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
              <li className="flex gap-2"><X className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /> No more per-user growth tax</li>
              <li className="flex gap-2"><X className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /> No login wall before voting</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> A flat, predictable $19/seat if you ever upgrade</li>
            </ul>
          </div>
        </div>

        <h2 className="mt-12 text-2xl font-bold text-ink">FAQ</h2>
        <dl className="mt-4 divide-y divide-slate-200">
          {c.faqs.map((f) => (
            <div key={f.q} className="py-4">
              <dt className="font-semibold text-ink">{f.q}</dt>
              <dd className="mt-1 text-sm text-ink-soft">{f.a}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 rounded-2xl bg-ink p-8 text-center">
          <h2 className="text-2xl font-bold text-white">Switch to a free {c.name} alternative</h2>
          <div className="mt-5"><LinkButton href="/signup" size="lg">Create your free board</LinkButton></div>
        </div>
      </section>
    </>
  );
}
