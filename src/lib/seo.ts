import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/utils";

export const SITE = {
  name: "Feedlark",
  tagline: "Free customer feedback boards, public roadmap & changelog",
  description:
    "Feedlark is the free, modern Canny alternative: feedback boards, a public roadmap and a changelog. Unlimited end-users, posts and votes, no growth tax.",
};

export function pageMetadata(opts: {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(opts.path ?? "/");
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    robots: opts.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: SITE.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
    },
  };
}
