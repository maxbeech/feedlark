"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { assertMembership } from "@/lib/auth/guard";
import { revalidatePublicWorkspace } from "@/lib/revalidate";

/**
 * Merge one or more duplicate posts INTO a target post: votes and comments move
 * across (votes deduped by voter so no one is double-counted), the sources are
 * deleted, and the target's count is recomputed authoritatively. Pro feature,
 * surfaced on the board manage page next to detected duplicates.
 */
export async function mergePostsAction(formData: FormData) {
  const targetId = String(formData.get("targetId"));
  const sourceIds = String(formData.get("sourceIds") || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!targetId || sourceIds.length === 0) return;

  const target = (await db.select().from(schema.posts).where(eq(schema.posts.id, targetId)).limit(1))[0];
  if (!target) return;
  await assertMembership(target.workspaceId);

  // Voters already on the target — used to dedupe incoming votes.
  const tgtVotes = await db.select({ voterKey: schema.votes.voterKey }).from(schema.votes).where(eq(schema.votes.postId, targetId));
  const seen = new Set(tgtVotes.map((v) => v.voterKey));

  for (const sourceId of sourceIds) {
    const src = (await db.select().from(schema.posts).where(eq(schema.posts.id, sourceId)).limit(1))[0];
    if (!src || src.id === targetId || src.workspaceId !== target.workspaceId) continue;

    const srcVotes = await db.select().from(schema.votes).where(eq(schema.votes.postId, sourceId));
    for (const v of srcVotes) {
      if (seen.has(v.voterKey)) {
        await db.delete(schema.votes).where(eq(schema.votes.id, v.id));
      } else {
        await db.update(schema.votes).set({ postId: targetId }).where(eq(schema.votes.id, v.id));
        seen.add(v.voterKey);
      }
    }
    await db.update(schema.comments).set({ postId: targetId }).where(eq(schema.comments.postId, sourceId));
    await db.delete(schema.shipNotifications).where(eq(schema.shipNotifications.postId, sourceId));
    await db.delete(schema.posts).where(eq(schema.posts.id, sourceId));
  }

  const counted = await db.select({ c: sql<number>`count(*)` }).from(schema.votes).where(eq(schema.votes.postId, targetId));
  await db.update(schema.posts).set({ voteCount: Number(counted[0]?.c ?? 0) }).where(eq(schema.posts.id, targetId));

  revalidatePath(`/dashboard/boards/${target.boardId}`);
  revalidatePath(`/dashboard/posts/${targetId}`);
  const ws = (await db.select({ slug: schema.workspaces.slug }).from(schema.workspaces).where(eq(schema.workspaces.id, target.workspaceId)).limit(1))[0];
  if (ws) revalidatePublicWorkspace(ws.slug);
}
