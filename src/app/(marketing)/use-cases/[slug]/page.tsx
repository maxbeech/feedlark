import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, ArrowRight } from "lucide-react";
import { USE_CASES, getUseCase } from "@/lib/content/use-cases";
import { LinkButton } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";

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
    <section className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-brand-600">For {u.audience}</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-ink">{u.title}</h1>
      <p className="mt-4 text-lg text-ink-soft">{u.intro}</p>
      <div className="mt-7"><LinkButton href="/signup" size="lg">Start free <ArrowRight className="h-4 w-4" /></LinkButton></div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold text-ink">The problem</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">{u.pains.map((p) => <li key={p}>• {p}</li>)}</ul>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6">
          <h2 className="font-semibold text-emerald-800">How Feedlark helps</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">{u.wins.map((w) => <li key={w} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {w}</li>)}</ul>
        </div>
      </div>

      <div className="mt-12 rounded-2xl bg-ink p-8 text-center">
        <h2 className="text-2xl font-bold text-white">Built for {u.audience}. Free to start.</h2>
        <div className="mt-5"><LinkButton href="/signup" size="lg">Create your free board</LinkButton></div>
      </div>
    </section>
  );
}
