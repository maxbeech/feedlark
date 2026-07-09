export type { Block, Faq, BlogCategory, BlogPost } from "./blog-types";
export { DEFAULT_AUTHOR, DEFAULT_CATEGORY } from "./blog-types";
export { extractLinks } from "./blog-links";

import type { BlogPost } from "./blog-types";
import { BLOG_FEEDBACK_BASICS } from "./blog-feedback-basics";
import { BLOG_FEATURE_REQUESTS } from "./blog-feature-requests";
import { BLOG_ROADMAP } from "./blog-roadmap";
import { BLOG_CHANGELOG_LOOP } from "./blog-changelog-loop";
import { BLOG_FEEDBACK_ANALYSIS } from "./blog-feedback-analysis";
import { BLOG_REVIEWS } from "./blog-reviews";
import { BLOG_REVIEWS_BEST_OF } from "./blog-reviews-best-of";
import { BLOG_NEWS } from "./blog-news";

export const BLOG_POSTS: BlogPost[] = [
  ...BLOG_FEEDBACK_BASICS,
  ...BLOG_FEATURE_REQUESTS,
  ...BLOG_ROADMAP,
  ...BLOG_CHANGELOG_LOOP,
  ...BLOG_FEEDBACK_ANALYSIS,
  ...BLOG_REVIEWS,
  ...BLOG_REVIEWS_BEST_OF,
  ...BLOG_NEWS,
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
