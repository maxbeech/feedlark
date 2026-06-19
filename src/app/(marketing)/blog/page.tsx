import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { BLOG_POSTS } from "@/lib/content/blog";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Blog: product feedback, roadmaps and changelogs",
  description: "Practical guides on collecting customer feedback, building public roadmaps, writing changelogs and closing the feedback loop.",
  path: "/blog",
});

export default function BlogIndex() {
  const posts = [...BLOG_POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Writing</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tightest text-ink md:text-5xl">The Feedlark blog</h1>
      <p className="mt-4 text-lg text-ink-soft">Practical notes on feedback, roadmaps and shipping in public.</p>
      <div className="mt-10 divide-y divide-sand-200 border-t border-sand-200">
        {posts.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="group flex items-start justify-between gap-6 py-6">
            <div>
              <p className="text-xs text-ink-muted">{p.date} · {p.readMins} min read</p>
              <h2 className="mt-1.5 font-display text-xl font-semibold text-ink transition-colors group-hover:text-brand-700">{p.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{p.description}</p>
            </div>
            <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-ink-muted transition-all group-hover:-translate-y-0.5 group-hover:text-brand-600" />
          </Link>
        ))}
      </div>
    </section>
  );
}
