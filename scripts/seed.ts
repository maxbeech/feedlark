/**
 * Seeds the dogfood "feedlark" workspace so /feedback is a live demo board.
 * Idempotent: does nothing if the workspace already exists. Run with:
 *   tsx scripts/seed.ts   (env: TURSO_DATABASE_URL, TURSO_AUTH_TOKEN)
 */
import { eq } from "drizzle-orm";
import { db, schema } from "../src/lib/db";
import { newId } from "../src/lib/ids";
import { hashPassword } from "../src/lib/auth/password";

async function main() {
  const existing = await db.select().from(schema.workspaces).where(eq(schema.workspaces.slug, "feedlark")).limit(1);
  if (existing.length) {
    console.log("Seed: 'feedlark' workspace already exists — skipping.");
    return;
  }

  const userId = newId("usr");
  await db.insert(schema.users).values({
    id: userId,
    email: "demo@feedlark.app",
    passwordHash: await hashPassword("feedlark-demo-" + newId("x")),
    name: "Feedlark Team",
  });

  const wsId = newId("ws");
  await db.insert(schema.workspaces).values({ id: wsId, ownerId: userId, name: "Feedlark", slug: "feedlark" });
  await db.insert(schema.workspaceMembers).values({ id: newId("mem"), workspaceId: wsId, userId, role: "owner" });

  const boardId = newId("brd");
  await db.insert(schema.boards).values({
    id: boardId,
    workspaceId: wsId,
    name: "Feature Requests",
    slug: "feature-requests",
    description: "What should we build next? Vote on ideas or add your own.",
  });

  const logShipped = newId("log");
  await db.insert(schema.changelogEntries).values({
    id: logShipped,
    workspaceId: wsId,
    title: "Custom domains are here",
    slug: "custom-domains",
    body: "You asked, we shipped: **Custom domains**. Pro workspaces can now host their board on their own domain. Thanks to everyone who voted! 🎉",
    category: "new",
    publishedAt: Math.floor(Date.now() / 1000) - 86400 * 2,
  });
  await db.insert(schema.changelogEntries).values({
    id: newId("log"),
    workspaceId: wsId,
    title: "Faster board loading",
    slug: "faster-boards",
    body: "Public boards now render up to 2x faster, especially on mobile.",
    category: "improved",
    publishedAt: Math.floor(Date.now() / 1000) - 86400 * 5,
  });

  const posts: [string, string, string, number, string | null][] = [
    ["Slack integration for new feedback", "Post new feedback into a Slack channel automatically.", "planned", 42, null],
    ["Dark mode for public boards", "An optional dark theme for the public board and roadmap.", "in_progress", 31, null],
    ["Custom domains on Pro", "Host my board on feedback.mycompany.com.", "complete", 28, logShipped],
    ["Jira sync", "Two-way sync between Feedlark posts and Jira issues.", "open", 19, null],
    ["Weekly email digest of new feedback", "A weekly summary of new posts and top voted items.", "under_review", 12, null],
    ["Anonymous voting toggle", "Let me require an email, or allow fully anonymous votes.", "open", 8, null],
  ];

  for (const [title, body, status, votes, shipped] of posts) {
    await db.insert(schema.posts).values({
      id: newId("post"),
      workspaceId: wsId,
      boardId,
      title,
      body,
      status,
      voteCount: votes,
      authorName: "A Feedlark user",
      shippedChangelogId: shipped,
    });
  }

  console.log("Seed: created 'feedlark' demo workspace with", posts.length, "posts.");
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
