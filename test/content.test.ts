import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { BLOG_POSTS, extractLinks } from "@/lib/content/blog";
import { COMPETITORS } from "@/lib/content/competitors";
import { USE_CASES } from "@/lib/content/use-cases";

// Copy files whose user-facing text must read like a human wrote it.
const COPY_FILES = [
  "../src/lib/content/blog-feedback-basics.ts",
  "../src/lib/content/blog-feature-requests.ts",
  "../src/lib/content/blog-roadmap.ts",
  "../src/lib/content/blog-changelog-loop.ts",
  "../src/lib/content/blog-feedback-analysis.ts",
  "../src/lib/content/blog-reviews.ts",
  "../src/lib/content/blog-reviews-best-of.ts",
  "../src/lib/content/blog-news.ts",
  "../src/lib/content/competitors.ts",
  "../src/lib/content/use-cases.ts",
  "../src/lib/content/faqs.ts",
  "../src/lib/plans.ts",
  "../src/lib/seo.ts",
  "../src/lib/ship-loop.ts",
];

describe("no AI tells in marketing copy", () => {
  it("contains no em or en dashes (a classic AI tell)", () => {
    for (const rel of COPY_FILES) {
      const src = readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
      expect(src.includes("—"), `em dash in ${rel}`).toBe(false);
      expect(src.includes("–"), `en dash in ${rel}`).toBe(false);
    }
  });
});

describe("blog SEO constraints", () => {
  it("titles are <= 56 chars (brand suffix is appended)", () => {
    for (const p of BLOG_POSTS) {
      expect(p.title.length, `title too long: "${p.title}" (${p.title.length})`).toBeLessThanOrEqual(56);
    }
  });
  it("meta descriptions are 140-158 chars", () => {
    for (const p of BLOG_POSTS) {
      expect(p.description.length, `desc len ${p.description.length} for ${p.slug}`).toBeGreaterThanOrEqual(140);
      expect(p.description.length, `desc len ${p.description.length} for ${p.slug}`).toBeLessThanOrEqual(158);
    }
  });
  it("slugs are unique and have content blocks", () => {
    const slugs = BLOG_POSTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const p of BLOG_POSTS) expect(p.blocks.length).toBeGreaterThan(2);
  });
  it("every post has an author and a category", () => {
    for (const p of BLOG_POSTS) {
      expect(p.author, `missing author: ${p.slug}`).toBeTruthy();
      expect(p.category, `missing category: ${p.slug}`).toBeTruthy();
    }
  });
  it("every post has 3-5 FAQs with FAQPage-ready shape", () => {
    for (const p of BLOG_POSTS) {
      expect(p.faqs?.length ?? 0, `faqs count for ${p.slug}`).toBeGreaterThanOrEqual(3);
      expect(p.faqs?.length ?? 0, `faqs count for ${p.slug}`).toBeLessThanOrEqual(5);
      for (const f of p.faqs ?? []) {
        expect(f.q.length, `faq question too short for ${p.slug}`).toBeGreaterThan(5);
        expect(f.a.length, `faq answer too short for ${p.slug}`).toBeGreaterThan(20);
      }
    }
  });
  it("every post has 3-6 internal links and 2-5 external links in its body copy", () => {
    for (const p of BLOG_POSTS) {
      const { internal, external } = extractLinks(p);
      expect(internal.length, `internal links for ${p.slug}`).toBeGreaterThanOrEqual(3);
      expect(internal.length, `internal links for ${p.slug}`).toBeLessThanOrEqual(6);
      expect(external.length, `external links for ${p.slug}`).toBeGreaterThanOrEqual(2);
      expect(external.length, `external links for ${p.slug}`).toBeLessThanOrEqual(5);
    }
  });
  it("every post has at least one table or quote block", () => {
    for (const p of BLOG_POSTS) {
      const hasRichBlock = p.blocks.some((b) => b.table || b.quote);
      expect(hasRichBlock, `no table/quote block in ${p.slug}`).toBe(true);
    }
  });
  it("every post has 1200+ words of body copy", () => {
    for (const p of BLOG_POSTS) {
      const words = p.blocks
        .map((b) => [b.p, b.h2, ...(b.ul ?? []), b.quote?.text, ...(b.table?.rows.flat() ?? [])].filter(Boolean).join(" "))
        .join(" ")
        .split(/\s+/)
        .filter(Boolean).length;
      expect(words, `word count for ${p.slug}`).toBeGreaterThanOrEqual(1200);
    }
  });
  it("category is one of the three taxonomy values", () => {
    for (const p of BLOG_POSTS) {
      expect(["Academy", "News", "Reviews"]).toContain(p.category);
    }
  });
  it("has at least one post in each category (format diversity)", () => {
    const cats = new Set(BLOG_POSTS.map((p) => p.category));
    expect(cats.has("Academy")).toBe(true);
    expect(cats.has("News")).toBe(true);
    expect(cats.has("Reviews")).toBe(true);
  });
});

describe("programmatic SEO pages", () => {
  it("competitor + use-case slugs are unique", () => {
    const cs = COMPETITORS.map((c) => c.slug);
    const us = USE_CASES.map((u) => u.slug);
    expect(new Set(cs).size).toBe(cs.length);
    expect(new Set(us).size).toBe(us.length);
  });
  it("every competitor has a comparison table + at least one FAQ", () => {
    for (const c of COMPETITORS) {
      expect(c.rows.length).toBeGreaterThan(2);
      expect(c.faqs.length).toBeGreaterThan(0);
    }
  });
});
