import { describe, it, expect } from "vitest";
import { BLOG_POSTS } from "@/lib/content/blog";
import { COMPETITORS } from "@/lib/content/competitors";
import { USE_CASES } from "@/lib/content/use-cases";

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
