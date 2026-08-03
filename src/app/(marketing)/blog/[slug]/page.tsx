import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getPost } from "@/lib/content/blog";
import { DEFAULT_AUTHOR, DEFAULT_CATEGORY } from "@/lib/content/blog-types";
import { LinkButton } from "@/components/ui";
import { pageMetadata, SITE } from "@/lib/seo";
import { JsonLd, faqJsonLd, breadcrumbJsonLd } from "@/components/json-ld";
import { renderRich } from "@/components/rich-text";
import { absoluteUrl } from "@/lib/utils";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return pageMetadata({ title: post.title, description: post.description, path: `/blog/${post.slug}`, image: post.image });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const author = post.author ?? DEFAULT_AUTHOR;
  const category = post.category ?? DEFAULT_CATEGORY;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": post.schemaType === "HowTo" ? "HowTo" : "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Person", name: author },
    publisher: { "@type": "Organization", name: SITE.name },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    articleSection: category,
    ...(post.image ? { image: post.image } : {}),
    ...(post.schemaType === "HowTo"
      ? {
          step: post.blocks
            .filter((b) => b.h2)
            .map((b) => ({ "@type": "HowToStep", name: b.h2, text: b.p ?? b.ul?.join(" ") ?? b.h2 })),
        }
      : {}),
  };

  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);

  return (
    <article className="mx-auto max-w-2xl px-4 py-16">
      <JsonLd data={articleLd} />
      <JsonLd data={breadcrumbLd} />
      {post.faqs && post.faqs.length > 0 && <JsonLd data={faqJsonLd(post.faqs)} />}
      <Link href="/blog" className="text-sm text-ink-muted hover:text-ink">← All posts</Link>
      <p className="mt-5 text-xs font-medium uppercase tracking-wide text-brand-600">
        {category} · {post.date} · {post.readMins} min read
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tightest text-ink md:text-[2.75rem] md:leading-[1.08]">{post.title}</h1>
      <p className="mt-3 text-sm text-ink-muted">By {author}</p>

      {post.image && (
        <div className="mt-8 overflow-hidden rounded-2xl">
          <Image
            src={post.image}
            alt={post.imageAlt ?? post.title}
            width={1080}
            height={608}
            className="w-full object-cover"
            priority
          />
        </div>
      )}

      <div className="prose-feedlark mt-8">
        {post.takeaways && post.takeaways.length > 0 && (
          <div className="not-prose rounded-2xl border border-brand-200 bg-brand-50/50 p-6">
            <p className="font-display text-sm font-semibold uppercase tracking-wide text-brand-700">Key takeaways</p>
            <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-ink-soft">
              {post.takeaways.map((t, i) => (
                <li key={i} className="flex gap-2"><span className="text-brand-600">•</span> {renderRich(t)}</li>
              ))}
            </ul>
          </div>
        )}

        {post.blocks.map((b, i) => (
          <div key={i}>
            {b.h2 && <h2>{b.h2}</h2>}
            {b.p && <p>{renderRich(b.p)}</p>}
            {b.ul && <ul>{b.ul.map((li, j) => <li key={j}>{renderRich(li)}</li>)}</ul>}
            {b.quote && (
              <blockquote className="not-prose my-6 border-l-2 border-brand-300 pl-5 italic text-ink-soft">
                <p>&ldquo;{renderRich(b.quote.text)}&rdquo;</p>
                <cite className="mt-2 block text-sm not-italic text-ink-muted">— {b.quote.cite}</cite>
              </blockquote>
            )}
            {b.table && (
              <div className="not-prose my-6 overflow-x-auto rounded-2xl border border-sand-200 shadow-soft">
                <table className="w-full text-sm">
                  <caption className="caption-top bg-cream px-4 py-2 text-left text-xs text-ink-muted">{b.table.caption}</caption>
                  <thead className="bg-cream text-left text-ink-muted">
                    <tr>
                      {b.table.head.map((h, hi) => <th key={hi} className="px-4 py-3 font-medium">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-200">
                    {b.table.rows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => <td key={ci} className="px-4 py-3 text-ink-soft">{renderRich(cell)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {post.faqs && post.faqs.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-2xl font-semibold tracking-tightest text-ink">Frequently asked questions</h2>
          <dl className="mt-4 divide-y divide-sand-200 border-t border-sand-200">
            {post.faqs.map((f, i) => (
              <div key={i} className="py-5">
                <dt className="font-semibold text-ink">{f.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink-soft">{renderRich(f.a)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {post.authorBio && (
        <p className="mt-10 border-t border-sand-200 pt-6 text-sm text-ink-muted">
          <span className="font-medium text-ink">{author}.</span> {post.authorBio}
        </p>
      )}

      <div className="mt-12 rounded-2xl border border-brand-200 bg-gradient-to-b from-brand-50/70 to-white p-7 text-center shadow-soft">
        <p className="font-display text-xl font-semibold text-ink">Collect feedback like this, for free</p>
        <p className="mt-1.5 text-sm text-ink-soft">Unlimited users. No growth tax.</p>
        <div className="mt-5"><LinkButton href="/signup">Start free</LinkButton></div>
      </div>
    </article>
  );
}
