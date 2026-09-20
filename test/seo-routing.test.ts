import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
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
});
