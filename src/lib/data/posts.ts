import "server-only";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export async function listBoardPosts(boardId: string, opts?: { includeClosed?: boolean }) {
  const rows = await db
    .select()
    .from(schema.posts)
    .where(eq(schema.posts.boardId, boardId))
    .orderBy(desc(schema.posts.pinned), desc(schema.posts.voteCount), desc(schema.posts.createdAt));
  return opts?.includeClosed ? rows : rows.filter((p) => p.status !== "closed");
}

export async function getPost(postId: string) {
  const rows = await db.select().from(schema.posts).where(eq(schema.posts.id, postId)).limit(1);
  return rows[0] ?? null;
}

export async function listComments(postId: string) {
  return db.select().from(schema.comments).where(eq(schema.comments.postId, postId)).orderBy(schema.comments.createdAt);
}

/** Which of the given posts the voter (by key) has already upvoted. */
export async function votedPostIds(voterKey: string, postIds: string[]): Promise<Set<string>> {
  if (!voterKey || postIds.length === 0) return new Set();
  const rows = await db
    .select({ postId: schema.votes.postId })
    .from(schema.votes)
    .where(and(eq(schema.votes.voterKey, voterKey), inArray(schema.votes.postId, postIds)));
  return new Set(rows.map((r) => r.postId));
}

/** Posts grouped for the public roadmap (planned / in_progress / complete). */
export async function roadmapPosts(workspaceId: string) {
  const rows = await db
    .select()
    .from(schema.posts)
    .where(
      and(
        eq(schema.posts.workspaceId, workspaceId),
        inArray(schema.posts.status, ["planned", "in_progress", "complete"]),
      ),
    )
    .orderBy(desc(schema.posts.voteCount), desc(schema.posts.createdAt));
  return {
    planned: rows.filter((p) => p.status === "planned"),
    in_progress: rows.filter((p) => p.status === "in_progress"),
    complete: rows.filter((p) => p.status === "complete"),
  };
}
