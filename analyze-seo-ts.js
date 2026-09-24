#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const contentDir = './src/lib/content';

const blogFiles = [
  'blog-feedback-basics.ts',
  'blog-feature-requests.ts',
  'blog-roadmap.ts',
  'blog-changelog-loop.ts',
  'blog-feedback-analysis.ts',
  'blog-reviews.ts',
  'blog-reviews-best-of.ts',
  'blog-news.ts',
  'blog-roadmap-extra.ts',
  'blog-feedback-extra.ts',
  'blog-reviews-extra.ts',
  'blog-news-extra.ts',
  'blog-client-feedback.ts',
  'blog-content-gap-fillers.ts',
  'blog-changelog-management.ts',
  'blog-benchmarks.ts',
  'blog-workflow-guides.ts',
  'blog-product-roadmap-tool.ts',
];

function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function extractTextFromBracketedContent(content, bracketLevel = 0) {
  let text = '';
  let i = 0;
  let inString = false;
  let stringChar = '"';
  let escaped = false;

  while (i < content.length) {
    const char = content[i];
    const nextChar = content[i + 1];

    // Handle escape sequences
    if (escaped) {
      escaped = false;
      i++;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      i++;
      continue;
    }

    // Handle strings
    if (!inString && (char === '"' || char === "'")) {
      stringChar = char;
      inString = true;
      i++;
      // Skip quote and start reading string content
      let stringContent = '';
      while (i < content.length) {
        const sc = content[i];
        if (sc === '\\') {
          i += 2;
          continue;
        }
        if (sc === stringChar) {
          text += ' ' + stringContent;
          inString = false;
          i++;
          break;
        }
        stringContent += sc;
        i++;
      }
      continue;
    }

    i++;
  }

  return text.trim();
}

function parsePostsFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const posts = [];

    // Find the array definition
    const arrayMatch = content.match(/export const \w+: BlogPost\[\] = \[([\s\S]*)\];/);
    if (!arrayMatch) return posts;

    const arrayContent = arrayMatch[1];

    // Split by opening brace of objects
    let depth = 0;
    let currentObject = '';
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < arrayContent.length; i++) {
      const char = arrayContent[i];
      const prevChar = i > 0 ? arrayContent[i - 1] : '';

      // Track strings
      if ((char === '"' || char === "'") && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }

      if (inString) {
        currentObject += char;
        continue;
      }

      if (char === '{') {
        depth++;
        currentObject += char;
      } else if (char === '}') {
        currentObject += char;
        depth--;

        if (depth === 0 && currentObject.trim()) {
          const post = parsePost(currentObject, filePath);
          if (post) posts.push(post);
          currentObject = '';
        }
      } else if (depth > 0) {
        currentObject += char;
      }
    }

    return posts;
  } catch (err) {
    console.error(`Error parsing ${filePath}:`, err.message);
    return [];
  }
}

function parsePost(objectStr, filePath) {
  try {
    const post = {};

    // Extract simple string fields
    const stringFields = ['slug', 'title', 'description', 'date', 'keyword', 'author', 'authorBio', 'imageAlt', 'category', 'schemaType'];

    stringFields.forEach(field => {
      const regex = new RegExp(`${field}\\s*:\\s*['"]((?:[^'"\\\\]|\\\\.)*?)['"]`, 's');
      const match = objectStr.match(regex);
      if (match) {
        post[field] = match[1];
      }
    });

    // Extract image URL
    const imageMatch = objectStr.match(/image\s*:\s*["'](https?:\/\/[^"']+)["']/);
    if (imageMatch) {
      post.image = imageMatch[1];
    }

    // Extract readMins
    const readMinsMatch = objectStr.match(/readMins\s*:\s*(\d+)/);
    if (readMinsMatch) {
      post.readMins = parseInt(readMinsMatch[1]);
    }

    // Extract blocks - count words in p, ul, and other text fields
    let wordCount = 0;

    // Count words in paragraphs
    const pMatches = objectStr.match(/p\s*:\s*["']((?:[^'"\\]|\\.)*?)["']/g);
    if (pMatches) {
      pMatches.forEach(m => {
        const content = m.match(/p\s*:\s*["']((?:[^'"\\]|\\.)*?)["']/)[1];
        wordCount += countWords(content);
      });
    }

    // Count words in headings
    const h2Matches = objectStr.match(/h2\s*:\s*["']((?:[^'"\\]|\\.)*?)["']/g);
    if (h2Matches) {
      h2Matches.forEach(m => {
        const content = m.match(/h2\s*:\s*["']((?:[^'"\\]|\\.)*?)["']/)[1];
        wordCount += countWords(content);
      });
    }

    // Count words in lists
    const ulMatches = objectStr.match(/ul\s*:\s*\[([\s\S]*?)\]/g);
    if (ulMatches) {
      ulMatches.forEach(m => {
        const content = m.match(/ul\s*:\s*\[([\s\S]*?)\]/)[1];
        const items = content.match(/["']((?:[^'"\\]|\\.)*?)["']/g);
        if (items) {
          items.forEach(item => {
            const text = item.match(/["']((?:[^'"\\]|\\.)*?)["']/)[1];
            wordCount += countWords(text);
          });
        }
      });
    }

    post.wordCount = wordCount;
    post.file = filePath;

    return post;
  } catch (err) {
    console.error(`Error parsing post object:`, err.message);
    return null;
  }
}

const allPosts = [];
blogFiles.forEach(file => {
  const filePath = path.join(contentDir, file);
  const posts = parsePostsFromFile(filePath);
  allPosts.push(...posts);
});

console.log(`Found ${allPosts.length} blog posts\n`);

// Analyze for SEO issues
const issues = [];
const titleMap = {};
const descriptionMap = {};

const today = new Date().toISOString().split('T')[0];

allPosts.forEach(post => {
  // Missing fields
  if (!post.slug) {
    issues.push({
      File: 'unknown',
      'Issue Type': 'Missing Slug',
      Details: 'Slug field is missing',
      Severity: 5,
      Status: 'open',
      'Found On': today
    });
    return;
  }

  if (!post.title) {
    issues.push({
      File: post.slug,
      'Issue Type': 'Missing Title',
      Details: 'Title field is missing',
      Severity: 5,
      Status: 'open',
      'Found On': today
    });
  } else if (post.title.length > 56) {
    issues.push({
      File: post.slug,
      'Issue Type': 'Title Too Long',
      Details: `Title is ${post.title.length} chars (max: 56)`,
      Severity: 2,
      Status: 'open',
      'Found On': today
    });
  }

  if (!post.description) {
    issues.push({
      File: post.slug,
      'Issue Type': 'Missing Meta Description',
      Details: 'Meta description field is missing',
      Severity: 5,
      Status: 'open',
      'Found On': today
    });
  } else if (post.description.length < 120 || post.description.length > 160) {
    issues.push({
      File: post.slug,
      'Issue Type': 'Meta Description Length',
      Details: `Description is ${post.description.length} chars (target: 140-158)`,
      Severity: 3,
      Status: 'open',
      'Found On': today
    });
  }

  if (!post.keyword) {
    issues.push({
      File: post.slug,
      'Issue Type': 'Missing Focus Keyword',
      Details: 'Focus keyword field is missing',
      Severity: 4,
      Status: 'open',
      'Found On': today
    });
  }

  if (!post.image) {
    issues.push({
      File: post.slug,
      'Issue Type': 'Missing Featured Image',
      Details: 'Featured image URL is missing',
      Severity: 3,
      Status: 'open',
      'Found On': today
    });
  }

  if (!post.imageAlt) {
    issues.push({
      File: post.slug,
      'Issue Type': 'Missing Image Alt Text',
      Details: 'Image alt text is missing',
      Severity: 3,
      Status: 'open',
      'Found On': today
    });
  }

  if (post.wordCount && post.wordCount < 300) {
    issues.push({
      File: post.slug,
      'Issue Type': 'Thin Content',
      Details: `Post is ${post.wordCount} words (target: 300+)`,
      Severity: 3,
      Status: 'open',
      'Found On': today
    });
  }

  // Track for duplicates
  if (post.title) {
    if (!titleMap[post.title]) titleMap[post.title] = [];
    titleMap[post.title].push(post.slug);
  }
  if (post.description) {
    if (!descriptionMap[post.description]) descriptionMap[post.description] = [];
    descriptionMap[post.description].push(post.slug);
  }
});

// Check duplicates
Object.entries(titleMap).forEach(([title, slugs]) => {
  if (slugs.length > 1) {
    slugs.forEach(slug => {
      issues.push({
        File: slug,
        'Issue Type': 'Duplicate Title',
        Details: `Shared with: ${slugs.filter(s => s !== slug).join(', ')}`,
        Severity: 4,
        Status: 'open',
        'Found On': today
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
        Details: `Shared with: ${slugs.filter(s => s !== slug).join(', ')}`,
        Severity: 4,
        Status: 'open',
        'Found On': today
      });
    });
  }
});

// Print summary
const issueBySeverity = {};
issues.forEach(issue => {
  if (!issueBySeverity[issue.Severity]) issueBySeverity[issue.Severity] = 0;
  issueBySeverity[issue.Severity]++;
});

console.log('SEO Issues Found:');
console.log(`Total issues: ${issues.length}`);
Object.entries(issueBySeverity).sort((a, b) => b[0] - a[0]).forEach(([sev, count]) => {
  console.log(`  Severity ${sev}: ${count} issues`);
});

console.log('\n---JSON OUTPUT---');
console.log(JSON.stringify(issues, null, 2));
