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
      <p className="mt-4 text-xs text-ink-muted">{post.date} · {post.readMins} min read</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">{post.title}</h1>

      <div className="prose-feedlark mt-8">
        {post.blocks.map((b, i) => (
          <div key={i}>
            {b.h2 && <h2>{b.h2}</h2>}
            {b.p && <p>{b.p}</p>}
            {b.ul && <ul>{b.ul.map((li, j) => <li key={j}>{li}</li>)}</ul>}
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-brand-50 p-6 text-center">
        <p className="font-semibold text-ink">Collect feedback like this, for free</p>
        <p className="mt-1 text-sm text-ink-soft">Unlimited users. No growth tax.</p>
        <div className="mt-4"><LinkButton href="/signup">Start free</LinkButton></div>
      </div>
    </article>
  );
}
