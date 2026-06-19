import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getPost } from "@/lib/content/blog";
import { LinkButton } from "@/components/ui";
import { pageMetadata, SITE } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl } from "@/lib/utils";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return pageMetadata({ title: post.title, description: post.description, path: `/blog/${post.slug}` });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
  };

  return (
    <article className="mx-auto max-w-2xl px-4 py-16">
      <JsonLd data={articleLd} />
      <Link href="/blog" className="text-sm text-ink-muted hover:text-ink">← All posts</Link>
      <p className="mt-5 text-xs font-medium uppercase tracking-wide text-brand-600">{post.date} · {post.readMins} min read</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tightest text-ink md:text-[2.75rem] md:leading-[1.08]">{post.title}</h1>

      <div className="prose-feedlark mt-8">
        {post.blocks.map((b, i) => (
          <div key={i}>
            {b.h2 && <h2>{b.h2}</h2>}
            {b.p && <p>{b.p}</p>}
            {b.ul && <ul>{b.ul.map((li, j) => <li key={j}>{li}</li>)}</ul>}
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-brand-200 bg-gradient-to-b from-brand-50/70 to-white p-7 text-center shadow-soft">
        <p className="font-display text-xl font-semibold text-ink">Collect feedback like this, for free</p>
        <p className="mt-1.5 text-sm text-ink-soft">Unlimited users. No growth tax.</p>
        <div className="mt-5"><LinkButton href="/signup">Start free</LinkButton></div>
      </div>
    </article>
  );
}
