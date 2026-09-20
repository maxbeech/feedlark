import type { MetadataRoute } from "next";
import { COMPETITORS } from "@/lib/content/competitors";
import { USE_CASES } from "@/lib/content/use-cases";
import { BLOG_POSTS } from "@/lib/content/blog";
import { absoluteUrl, PUBLIC_DEMO_PATHS } from "@/lib/utils";

// Static marketing content changes only in deployments. Cache it at the edge
// for a week; a deployment replaces the static asset immediately.
export const revalidate = 604800;

export default function sitemap(): MetadataRoute.Sitemap {
  const stat = ["/", "/pricing", "/blog", "/about"].map((p) => ({
    url: absoluteUrl(p),
    changeFrequency: "weekly" as const,
    priority: p === "/" ? 1 : 0.8,
  }));
  const alts = COMPETITORS.map((c) => ({ url: absoluteUrl(`/alternatives/${c.slug}`), priority: 0.7 }));
  const uses = USE_CASES.map((u) => ({ url: absoluteUrl(`/use-cases/${u.slug}`), priority: 0.6 }));
  const posts = BLOG_POSTS.map((p) => ({ url: absoluteUrl(`/blog/${p.slug}`), lastModified: p.date, priority: 0.6 }));
  // Dogfood: our own public board surfaces (real, indexable product pages).
  const demo = Object.values(PUBLIC_DEMO_PATHS).map((p) => ({ url: absoluteUrl(p), priority: 0.5 }));
  return [...stat, ...alts, ...uses, ...posts, ...demo];
}
