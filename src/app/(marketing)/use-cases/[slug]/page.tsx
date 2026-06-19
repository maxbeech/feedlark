import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, ArrowRight } from "lucide-react";
import { USE_CASES, getUseCase } from "@/lib/content/use-cases";
import { LinkButton } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";
import { RoadmapMockup } from "@/components/marketing/mockups";

export function generateStaticParams() {
  return USE_CASES.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const u = getUseCase(slug);
  if (!u) return {};
  return pageMetadata({ title: u.title, description: u.intro.slice(0, 155), path: `/use-cases/${u.slug}` });
}

export default async function UseCasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const u = getUseCase(slug);
  if (!u) notFound();

  return (
    <>
      <section className="grain relative overflow-hidden border-b border-sand-200 bg-paper">
        <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">For {u.audience}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tightest text-ink md:text-5xl">{u.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">{u.intro}</p>
          <div className="mt-7 flex justify-center"><LinkButton href="/signup" size="lg">Start free <ArrowRight className="h-4 w-4" /></LinkButton></div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <RoadmapMockup className="mx-auto max-w-3xl" />

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold text-ink">The problem</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">{u.pains.map((p) => <li key={p} className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-muted" /> {p}</li>)}</ul>
          </div>
          <div className="rounded-2xl border border-spruce-100 bg-spruce-50 p-6">
            <h2 className="font-display text-lg font-semibold text-spruce-700">How Feedlark helps</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">{u.wins.map((w) => <li key={w} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-spruce-600" /> {w}</li>)}</ul>
          </div>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl bg-ink p-8 text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tightest text-white">Built for {u.audience}. Free to start.</h2>
          <div className="mt-5"><LinkButton href="/signup" size="lg">Create your free board</LinkButton></div>
        </div>
      </section>
    </>
  );
}
