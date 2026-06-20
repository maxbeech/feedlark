import "server-only";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";

// Bounded to keep memory/transfer sane; client-side filter/sort runs over this.
const BOARD_POST_CAP = 500;

export async function listBoardPosts(boardId: string, opts?: { includeClosed?: boolean }) {
  const rows = await db
    .select()
    .from(schema.posts)
    .where(eq(schema.posts.boardId, boardId))
    .orderBy(desc(schema.posts.pinned), desc(schema.posts.voteCount), desc(schema.posts.createdAt))
    .limit(BOARD_POST_CAP);
  return opts?.includeClosed ? rows : rows.filter((p) => p.status !== "closed");
}

/** Post counts per board for a workspace, in one grouped query (no N+1). */
export async function boardPostCounts(workspaceId: string): Promise<Record<string, number>> {
  const rows = await db
    .select({ boardId: schema.posts.boardId, n: sql<number>`count(*)` })
    .from(schema.posts)
    .where(eq(schema.posts.workspaceId, workspaceId))
    .groupBy(schema.posts.boardId);
  return Object.fromEntries(rows.map((r) => [r.boardId, Number(r.n)]));
}

export async function getPost(postId: string) {
  const rows = await db.select().from(schema.posts).where(eq(schema.posts.id, postId)).limit(1);
  return rows[0] ?? null;
}

/** Comments for a post. Internal team notes are excluded unless asked for. */
export async function listComments(postId: string, opts?: { includeInternal?: boolean }) {
  const rows = await db.select().from(schema.comments).where(eq(schema.comments.postId, postId)).orderBy(schema.comments.createdAt);
  return opts?.includeInternal ? rows : rows.filter((c) => !c.isInternal);
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

/**
 * Posts grouped for the PUBLIC roadmap (planned / in_progress / complete).
 * Joins boards and excludes private boards so private-board content never leaks
 * onto the public roadmap or its JSON-LD.
 */
export async function roadmapPosts(workspaceId: string) {
  const rows = await db
    .select()
    .from(schema.posts)
    .innerJoin(schema.boards, eq(schema.posts.boardId, schema.boards.id))
    .where(
      and(
        eq(schema.posts.workspaceId, workspaceId),
        eq(schema.boards.isPrivate, false),
        inArray(schema.posts.status, ["planned", "in_progress", "complete"]),
      ),
    )
    .orderBy(desc(schema.posts.voteCount), desc(schema.posts.createdAt));
  const posts = rows.map((r) => r.posts);
  return {
    planned: posts.filter((p) => p.status === "planned"),
    in_progress: posts.filter((p) => p.status === "in_progress"),
    complete: posts.filter((p) => p.status === "complete"),
  };
}
