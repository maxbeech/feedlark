import Link from "next/link";
import type { Metadata } from "next";
import { BLOG_POSTS } from "@/lib/content/blog";
import { Card } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Blog — product feedback, roadmaps & changelogs",
  description: "Guides on collecting customer feedback, building public roadmaps, writing changelogs and closing the feedback loop.",
  path: "/blog",
});

export default function BlogIndex() {
  const posts = [...BLOG_POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-extrabold tracking-tight text-ink">The Feedlark blog</h1>
      <p className="mt-3 text-ink-soft">Practical guides on feedback, roadmaps and shipping in public.</p>
      <div className="mt-10 space-y-4">
        {posts.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`}>
            <Card className="p-6 transition-shadow hover:shadow-md">
              <p className="text-xs text-ink-muted">{p.date} · {p.readMins} min read</p>
              <h2 className="mt-1 text-xl font-semibold text-ink">{p.title}</h2>
              <p className="mt-1 text-sm text-ink-soft">{p.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
