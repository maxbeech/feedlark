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
import { BLOG_ROADMAP_EXTRA } from "./blog-roadmap-extra";
import { BLOG_FEEDBACK_EXTRA } from "./blog-feedback-extra";
import { BLOG_REVIEWS_EXTRA } from "./blog-reviews-extra";
import { BLOG_NEWS_EXTRA } from "./blog-news-extra";
import { BLOG_CLIENT_FEEDBACK } from "./blog-client-feedback";
import { BLOG_CONTENT_GAP_FILLERS } from "./blog-content-gap-fillers";
import { BLOG_CHANGELOG_MANAGEMENT } from "./blog-changelog-management";
import { BLOG_BENCHMARKS } from "./blog-benchmarks";
import { BLOG_WORKFLOW_GUIDES } from "./blog-workflow-guides";

export const BLOG_POSTS: BlogPost[] = [
  ...BLOG_FEEDBACK_BASICS,
  ...BLOG_FEATURE_REQUESTS,
  ...BLOG_ROADMAP,
  ...BLOG_CHANGELOG_LOOP,
  ...BLOG_FEEDBACK_ANALYSIS,
  ...BLOG_REVIEWS,
  ...BLOG_REVIEWS_BEST_OF,
  ...BLOG_NEWS,
  ...BLOG_ROADMAP_EXTRA,
  ...BLOG_FEEDBACK_EXTRA,
  ...BLOG_REVIEWS_EXTRA,
  ...BLOG_NEWS_EXTRA,
  ...BLOG_CLIENT_FEEDBACK,
  ...BLOG_CONTENT_GAP_FILLERS,
  ...BLOG_CHANGELOG_MANAGEMENT,
  ...BLOG_BENCHMARKS,
  ...BLOG_WORKFLOW_GUIDES,
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
