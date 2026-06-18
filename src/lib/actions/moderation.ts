"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { assertMembership } from "@/lib/auth/guard";

/** Manual child cleanup (libSQL doesn't enforce FK cascades by default). */
async function purgePost(postId: string) {
  await db.delete(schema.votes).where(eq(schema.votes.postId, postId));
  await db.delete(schema.comments).where(eq(schema.comments.postId, postId));
  await db.delete(schema.shipNotifications).where(eq(schema.shipNotifications.postId, postId));
  await db.delete(schema.posts).where(eq(schema.posts.id, postId));
}

export async function deletePostAction(formData: FormData) {
  const postId = String(formData.get("postId"));
  const post = (await db.select().from(schema.posts).where(eq(schema.posts.id, postId)).limit(1))[0];
  if (!post) return;
  await assertMembership(post.workspaceId);
  await purgePost(postId);
  const ws = (await db.select({ slug: schema.workspaces.slug }).from(schema.workspaces).where(eq(schema.workspaces.id, post.workspaceId)).limit(1))[0];
  if (ws) revalidatePath(`/b/${ws.slug}/roadmap`);
  redirect(`/dashboard/boards/${post.boardId}`);
}

const editPostSchema = z.object({ postId: z.string().min(1), title: z.string().trim().min(3).max(140), body: z.string().trim().max(4000).optional() });

export async function editPostAction(_prev: { error?: string }, formData: FormData) {
  const parsed = editPostSchema.safeParse({ postId: formData.get("postId"), title: formData.get("title"), body: formData.get("body") || undefined });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const post = (await db.select().from(schema.posts).where(eq(schema.posts.id, parsed.data.postId)).limit(1))[0];
  if (!post) return { error: "Post not found." };
  await assertMembership(post.workspaceId);
  await db.update(schema.posts).set({ title: parsed.data.title, body: parsed.data.body ?? "" }).where(eq(schema.posts.id, post.id));
  revalidatePath(`/dashboard/posts/${post.id}`);
  return { ok: true };
}

export async function deleteCommentAction(formData: FormData) {
  const commentId = String(formData.get("commentId"));
  const comment = (await db.select().from(schema.comments).where(eq(schema.comments.id, commentId)).limit(1))[0];
  if (!comment) return;
  const post = (await db.select().from(schema.posts).where(eq(schema.posts.id, comment.postId)).limit(1))[0];
  if (!post) return;
  await assertMembership(post.workspaceId);
  await db.delete(schema.comments).where(eq(schema.comments.id, commentId));
  revalidatePath(`/dashboard/posts/${post.id}`);
}

const editBoardSchema = z.object({ boardId: z.string().min(1), name: z.string().trim().min(2).max(60), description: z.string().trim().max(280).optional() });

export async function editBoardAction(_prev: { error?: string }, formData: FormData) {
  const parsed = editBoardSchema.safeParse({ boardId: formData.get("boardId"), name: formData.get("name"), description: formData.get("description") || undefined });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const board = (await db.select().from(schema.boards).where(eq(schema.boards.id, parsed.data.boardId)).limit(1))[0];
  if (!board) return { error: "Board not found." };
  await assertMembership(board.workspaceId);
  await db.update(schema.boards).set({ name: parsed.data.name, description: parsed.data.description ?? "" }).where(eq(schema.boards.id, board.id));
  revalidatePath(`/dashboard/boards/${board.id}`);
  return { ok: true };
}

export async function deleteBoardAction(formData: FormData) {
  const boardId = String(formData.get("boardId"));
  const board = (await db.select().from(schema.boards).where(eq(schema.boards.id, boardId)).limit(1))[0];
  if (!board) return;
  await assertMembership(board.workspaceId);
  const posts = await db.select({ id: schema.posts.id }).from(schema.posts).where(eq(schema.posts.boardId, boardId));
  for (const p of posts) await purgePost(p.id);
  await db.delete(schema.boards).where(eq(schema.boards.id, boardId));
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function deleteChangelogAction(formData: FormData) {
  const id = String(formData.get("entryId"));
  const entry = (await db.select().from(schema.changelogEntries).where(eq(schema.changelogEntries.id, id)).limit(1))[0];
  if (!entry) return;
  await assertMembership(entry.workspaceId);
  await db.delete(schema.changelogEntries).where(eq(schema.changelogEntries.id, id));
  // Unlink any post that pointed at this entry so it no longer shows "Shipped → changelog".
  if (entry.linkedPostId) {
    await db.update(schema.posts).set({ shippedChangelogId: null }).where(eq(schema.posts.id, entry.linkedPostId));
  }
  const ws = (await db.select({ slug: schema.workspaces.slug }).from(schema.workspaces).where(eq(schema.workspaces.id, entry.workspaceId)).limit(1))[0];
  revalidatePath("/dashboard/changelog");
  if (ws) revalidatePath(`/b/${ws.slug}/changelog`);
}
