import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { GET } from "@/app/llms.txt/route";
import { PLAN_LIMITS, PRO_PRICE_MONTHLY } from "@/lib/plans";
import { faqJsonLd, jsonLdString, softwareAppJsonLd } from "@/lib/structured-data";
import { PUBLIC_DEMO_PATHS, PUBLIC_ORIGIN, absoluteUrl } from "@/lib/utils";

describe("search-facing routing", () => {
  it("publishes only canonical www URLs and no redirecting /feedback alias", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls.length).toBeGreaterThan(40);
    expect(urls.every((url) => url.startsWith(PUBLIC_ORIGIN))).toBe(true);
    expect(urls).not.toContain(absoluteUrl("/feedback"));
    expect(urls).toContain(absoluteUrl(PUBLIC_DEMO_PATHS.board));
    expect(urls).toContain(absoluteUrl(PUBLIC_DEMO_PATHS.roadmap));
    expect(urls).toContain(absoluteUrl(PUBLIC_DEMO_PATHS.changelog));
  });

  it("advertises the canonical sitemap in robots.txt", () => {
    expect(robots().sitemap).toBe(absoluteUrl("/sitemap.xml"));
  });

  it.each(["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "CCBot"])(
    "explicitly welcomes %s while keeping private paths closed",
    (userAgent) => {
      const rule = robots().rules;
      const group = (Array.isArray(rule) ? rule : [rule]).find((r) => r.userAgent === userAgent);
      expect(group, `no robots.txt group for ${userAgent}`).toBeDefined();
      expect(group?.allow).toBe("/");
      expect(group?.disallow).toEqual(expect.arrayContaining(["/dashboard", "/api/", "/login", "/signup"]));
    },
  );
});

describe("FAQ structured data", () => {
  it("keeps the link label and drops markdown link syntax from FAQ answer text", () => {
    const answer =
      "Surveys validate questions, while [feedback management software](/blog/feedback-management-software-explained) surfaces ideas.";
    const schema = faqJsonLd([{ q: "Do surveys replace feedback tools?", a: answer }]);
    const text = schema.mainEntity[0].acceptedAnswer.text;
    expect(text).toBe("Surveys validate questions, while feedback management software surfaces ideas.");
    expect(text).not.toMatch(/\]\(/);
  });
});

describe("machine-readable pricing", () => {
  it("emits the Pro offer at the plan constant as a monthly per-seat price that parses", () => {
    const parsed = JSON.parse(jsonLdString(softwareAppJsonLd()));
    const pro = parsed.offers.find((o: { name: string }) => o.name.startsWith("Pro"));
    expect(pro.price).toBe(String(PRO_PRICE_MONTHLY));
    expect(pro.priceSpecification.billingDuration).toBe("P1M");
    expect(pro.priceSpecification.price).toBe(String(PRO_PRICE_MONTHLY));
  });

  it("states the same Pro price and seat limit in llms.txt", async () => {
    const body = await (await GET()).text();
    expect(body).toContain(`$${PRO_PRICE_MONTHLY} per ADMIN seat / month`);
    expect(body).toContain(`up to ${PLAN_LIMITS.pro.seats} seats`);
  });
});
