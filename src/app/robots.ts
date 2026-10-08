import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 604800;

const PRIVATE_PATHS = ["/dashboard", "/api/", "/login", "/signup"];
// AI crawlers are named so the welcoming policy is explicit. A named group overrides "*", so it repeats the private paths.
const AI_CRAWLERS = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "CCBot"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/", disallow: PRIVATE_PATHS })),
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
