/**
 * Inline text may contain markdown-style links, e.g. "[public roadmap](/blog/how-to-build-public-roadmap)"
 * or "[Recurly](https://recurly.com/research/churn-rate-benchmarks/)". Rendered by RichText.
 */
export interface Block {
  h2?: string;
  p?: string;
  ul?: string[];
  /** An expert or team quote rendered as a pull-quote. */
  quote?: { text: string; cite: string };
  /** A small data table with a descriptive caption. */
  table?: { caption: string; head: string[]; rows: string[][] };
}

export interface Faq {
  q: string;
  a: string;
}

export type BlogCategory = "Academy" | "News" | "Reviews";

export interface BlogPost {
  slug: string;
  title: string; // <= 56 chars (brand suffix is appended)
  description: string; // 140-158 chars
  date: string; // YYYY-MM-DD
  keyword: string;
  readMins: number;
  image?: string; // Unsplash "regular" URL (1080px wide)
  imageAlt?: string;
  author?: string; // defaults to "Feedlark Team" when omitted
  authorBio?: string;
  category?: BlogCategory; // defaults to "Academy" when omitted
  /** Schema.org type for the JSON-LD article block. Defaults to BlogPosting. */
  schemaType?: "BlogPosting" | "HowTo" | "Review";
  blocks: Block[];
  /** TL;DR key takeaways, shown in a highlighted box under the intro. */
  takeaways?: string[];
  /** 3-5 FAQs. Rendered on the page and emitted as FAQPage JSON-LD. */
  faqs?: Faq[];
}

export const DEFAULT_AUTHOR = "Feedlark Team";
export const DEFAULT_CATEGORY: BlogCategory = "Academy";
