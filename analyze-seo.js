#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Import blog data
const blogFeedbackBasics = require('./src/lib/content/blog-feedback-basics');
const blogFeatureRequests = require('./src/lib/content/blog-feature-requests');
const blogRoadmap = require('./src/lib/content/blog-roadmap');
const blogChangelogLoop = require('./src/lib/content/blog-changelog-loop');
const blogFeedbackAnalysis = require('./src/lib/content/blog-feedback-analysis');
const blogReviews = require('./src/lib/content/blog-reviews');
const blogReviewsBestOf = require('./src/lib/content/blog-reviews-best-of');
const blogNews = require('./src/lib/content/blog-news');
const blogRoadmapExtra = require('./src/lib/content/blog-roadmap-extra');
const blogFeedbackExtra = require('./src/lib/content/blog-feedback-extra');
const blogReviewsExtra = require('./src/lib/content/blog-reviews-extra');
const blogNewsExtra = require('./src/lib/content/blog-news-extra');
const blogClientFeedback = require('./src/lib/content/blog-client-feedback');
const blogContentGapFillers = require('./src/lib/content/blog-content-gap-fillers');
const blogChangelogManagement = require('./src/lib/content/blog-changelog-management');
const blogBenchmarks = require('./src/lib/content/blog-benchmarks');
const blogWorkflowGuides = require('./src/lib/content/blog-workflow-guides');
const blogProductRoadmapTool = require('./src/lib/content/blog-product-roadmap-tool');

const allPosts = [
  ...blogFeedbackBasics.BLOG_FEEDBACK_BASICS,
  ...blogFeatureRequests.BLOG_FEATURE_REQUESTS,
  ...blogRoadmap.BLOG_ROADMAP,
  ...blogChangelogLoop.BLOG_CHANGELOG_LOOP,
  ...blogFeedbackAnalysis.BLOG_FEEDBACK_ANALYSIS,
  ...blogReviews.BLOG_REVIEWS,
  ...blogReviewsBestOf.BLOG_REVIEWS_BEST_OF,
  ...blogNews.BLOG_NEWS,
  ...blogRoadmapExtra.BLOG_ROADMAP_EXTRA,
  ...blogFeedbackExtra.BLOG_FEEDBACK_EXTRA,
  ...blogReviewsExtra.BLOG_REVIEWS_EXTRA,
  ...blogNewsExtra.BLOG_NEWS_EXTRA,
  ...blogClientFeedback.BLOG_CLIENT_FEEDBACK,
  ...blogContentGapFillers.BLOG_CONTENT_GAP_FILLERS,
  ...blogChangelogManagement.BLOG_CHANGELOG_MANAGEMENT,
  ...blogBenchmarks.BLOG_BENCHMARKS,
  ...blogWorkflowGuides.BLOG_WORKFLOW_GUIDES,
  ...blogProductRoadmapTool.BLOG_PRODUCT_ROADMAP_TOOL,
];

function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
}

function extractTextFromBlocks(blocks) {
  let text = '';
  if (Array.isArray(blocks)) {
    blocks.forEach(block => {
      if (block.p) text += ' ' + block.p;
      if (block.h2) text += ' ' + block.h2;
      if (Array.isArray(block.ul)) text += ' ' + block.ul.join(' ');
      if (block.quote?.text) text += ' ' + block.quote.text;
      if (block.table?.caption) text += ' ' + block.table.caption;
      if (Array.isArray(block.table?.rows)) {
        block.table.rows.forEach(row => text += ' ' + row.join(' '));
      }
    });
  }
  return text;
}

const issues = [];
const titleMap = {};
const descriptionMap = {};

console.log(`Total posts to analyze: ${allPosts.length}\n`);

allPosts.forEach((post, idx) => {
  const file = `src/lib/content/blog-*.ts`;

  // Count words
  const contentText = extractTextFromBlocks(post.blocks);
  const wordCount = countWords(contentText);

  // Check for missing fields
  if (!post.title) {
    issues.push({
      File: post.slug,
      'Issue Type': 'Missing Title',
      Details: 'Title field is missing',
      Severity: 5,
      Status: 'open',
      'Found On': new Date().toISOString().split('T')[0]
    });
  }

  if (!post.description) {
    issues.push({
      File: post.slug,
      'Issue Type': 'Missing Meta Description',
      Details: 'Meta description field is missing',
      Severity: 5,
      Status: 'open',
      'Found On': new Date().toISOString().split('T')[0]
    });
  } else if (post.description.length < 120 || post.description.length > 160) {
    issues.push({
      File: post.slug,
      'Issue Type': 'Meta Description Length',
      Details: `Description is ${post.description.length} chars (target: 140-158)`,
      Severity: 3,
      Status: 'open',
      'Found On': new Date().toISOString().split('T')[0]
    });
  }

  if (!post.keyword) {
    issues.push({
      File: post.slug,
      'Issue Type': 'Missing Focus Keyword',
      Details: 'Focus keyword field is missing',
      Severity: 4,
      Status: 'open',
      'Found On': new Date().toISOString().split('T')[0]
    });
  }

  if (!post.image) {
    issues.push({
      File: post.slug,
      'Issue Type': 'Missing Featured Image',
      Details: 'Featured image URL is missing',
      Severity: 3,
      Status: 'open',
      'Found On': new Date().toISOString().split('T')[0]
    });
  }

  if (!post.imageAlt) {
    issues.push({
      File: post.slug,
      'Issue Type': 'Missing Image Alt Text',
      Details: 'Image alt text is missing',
      Severity: 3,
      Status: 'open',
      'Found On': new Date().toISOString().split('T')[0]
    });
  }

  // Check for thin content
  if (wordCount < 300) {
    issues.push({
      File: post.slug,
      'Issue Type': 'Thin Content',
      Details: `Post is ${wordCount} words (target: 300+)`,
      Severity: 3,
      Status: 'open',
      'Found On': new Date().toISOString().split('T')[0]
    });
  }

  // Check for title length
  if (post.title && post.title.length > 56) {
    issues.push({
      File: post.slug,
      'Issue Type': 'Title Too Long',
      Details: `Title is ${post.title.length} chars (max: 56)`,
      Severity: 2,
      Status: 'open',
      'Found On': new Date().toISOString().split('T')[0]
    });
  }

  // Track titles and descriptions for duplicates
  if (post.title) {
    if (!titleMap[post.title]) titleMap[post.title] = [];
    titleMap[post.title].push(post.slug);
  }

  if (post.description) {
    if (!descriptionMap[post.description]) descriptionMap[post.description] = [];
    descriptionMap[post.description].push(post.slug);
  }
});

// Check for duplicates
Object.entries(titleMap).forEach(([title, slugs]) => {
  if (slugs.length > 1) {
    slugs.forEach(slug => {
      issues.push({
        File: slug,
        'Issue Type': 'Duplicate Title',
        Details: `Title shared with: ${slugs.filter(s => s !== slug).join(', ')}`,
        Severity: 4,
        Status: 'open',
        'Found On': new Date().toISOString().split('T')[0]
      });
    });
  }
});

Object.entries(descriptionMap).forEach(([desc, slugs]) => {
  if (slugs.length > 1) {
    slugs.forEach(slug => {
      issues.push({
        File: slug,
        'Issue Type': 'Duplicate Meta Description',
        Details: `Description shared with: ${slugs.filter(s => s !== slug).join(', ')}`,
        Severity: 4,
        Status: 'open',
        'Found On': new Date().toISOString().split('T')[0]
      });
    });
  }
});

// Output issues as JSON
console.log(JSON.stringify(issues, null, 2));
