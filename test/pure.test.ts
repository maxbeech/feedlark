import { describe, it, expect } from "vitest";
import { slugify, isReservedSlug, statusLabel, ROADMAP_COLUMNS } from "@/lib/utils";
import { limitsFor, PLAN_LIMITS } from "@/lib/plans";
import { dedupeEmails, shipChangelogTitle, shipChangelogBody } from "@/lib/ship-loop";
import { tokenize, similarity, clusterDuplicates } from "@/lib/dedupe";
import { xmlEscape, buildRssFeed } from "@/lib/feeds";
import { jsonLdString, faqJsonLd } from "@/lib/structured-data";

describe("slugify", () => {
  it("makes url-safe slugs", () => {
    expect(slugify("Add Dark Mode!")).toBe("add-dark-mode");
    expect(slugify("  Multiple   spaces  ")).toBe("multiple-spaces");
    expect(slugify("Café & Bar")).toBe("caf-bar");
  });
  it("never returns empty", () => {
    expect(slugify("!!!")).toBe("item");
  });
});

describe("reserved slugs", () => {
  it("flags reserved handles", () => {
    expect(isReservedSlug("api")).toBe(true);
    expect(isReservedSlug("dashboard")).toBe(true);
    expect(isReservedSlug("acme")).toBe(false);
  });
});

describe("statusLabel", () => {
  it("maps statuses, with complete -> Shipped", () => {
    expect(statusLabel("complete")).toBe("Shipped");
    expect(statusLabel("in_progress")).toBe("In Progress");
    expect(statusLabel("open")).toBe("Open");
  });
  it("roadmap columns are the 3 public ones", () => {
    expect(ROADMAP_COLUMNS.map((c) => c.status)).toEqual(["planned", "in_progress", "complete"]);
  });
});

describe("plan limits — the 'no growth tax' guarantee", () => {
  it("free plan has unlimited boards and no per-user cap", () => {
    expect(PLAN_LIMITS.free.maxBoards).toBeNull();
    expect(limitsFor("free").canRemoveBranding).toBe(false);
    expect(limitsFor("pro").canRemoveBranding).toBe(true);
    expect(limitsFor("pro").canCustomDomain).toBe(true);
  });
  it("unknown plan falls back to free", () => {
    expect(limitsFor("enterprise").canUseAI).toBe(false);
  });
});

describe("ship-loop notify helpers", () => {
  it("dedupes + lowercases emails, dropping invalids", () => {
    expect(dedupeEmails(["A@x.com", "a@x.com", null, "b@y.com", "nope", undefined])).toEqual(["a@x.com", "b@y.com"]);
  });
  it("builds changelog title/body", () => {
    expect(shipChangelogTitle("Dark mode")).toBe("Dark mode");
    expect(shipChangelogBody("Dark mode", 1)).toContain("1 person");
    expect(shipChangelogBody("Dark mode", 5)).toContain("5 people");
  });
});

describe("duplicate detection", () => {
  it("tokenizes ignoring stopwords", () => {
    expect([...tokenize("Please add dark mode support")]).toEqual(["dark", "mode"]);
  });
  it("scores similar titles high and different low", () => {
    expect(similarity("Add dark mode", "Dark mode please")).toBeGreaterThanOrEqual(0.5);
    expect(similarity("Add dark mode", "Slack integration")).toBe(0);
  });
  it("clusters near-duplicates", () => {
    const clusters = clusterDuplicates([
      { id: "1", title: "Add dark mode" },
      { id: "2", title: "Dark mode please" },
      { id: "3", title: "Slack integration" },
    ]);
    expect(clusters).toHaveLength(1);
    expect(clusters[0].map((c) => c.id).sort()).toEqual(["1", "2"]);
  });
});

describe("RSS feed", () => {
  it("escapes XML special chars", () => {
    expect(xmlEscape('a & b < c > "d"')).toBe("a &amp; b &lt; c &gt; &quot;d&quot;");
  });
  it("builds a valid-looking feed with escaped item content", () => {
    const xml = buildRssFeed({
      title: "Acme changelog",
      link: "https://x.test/c",
      description: "Updates",
      items: [{ title: "New & shiny", link: "https://x.test/c#1", description: "<b>hi</b>", guid: "1", pubDate: new Date(0) }],
    });
    expect(xml).toContain("<rss version=\"2.0\">");
    expect(xml).toContain("New &amp; shiny");
    expect(xml).toContain("&lt;b&gt;hi&lt;/b&gt;");
    expect(xml).not.toContain("<b>hi</b>");
  });
});

describe("JSON-LD", () => {
  it("escapes < to prevent </script> breakout", () => {
    const s = jsonLdString({ x: "</script><script>alert(1)" });
    expect(s).not.toContain("</script>");
    expect(s).toContain("\\u003c/script>");
  });
  it("faqJsonLd produces FAQPage shape", () => {
    const ld = faqJsonLd([{ q: "Q?", a: "A." }]) as Record<string, any>;
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.mainEntity[0].acceptedAnswer.text).toBe("A.");
  });
});
