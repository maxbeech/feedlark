import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { BLOG_POSTS } from "@/lib/content/blog";
import { COMPETITORS } from "@/lib/content/competitors";
import { USE_CASES } from "@/lib/content/use-cases";

// Copy files whose user-facing text must read like a human wrote it.
const COPY_FILES = [
  "../src/lib/content/blog.ts",
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
