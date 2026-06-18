"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { newId } from "@/lib/ids";
import { ensureVoterKey } from "@/lib/voter";

const postSchema = z.object({
  boardId: z.string().min(1),
  title: z.string().trim().min(3, "Give your idea a short title").max(140),
  body: z.string().trim().max(4000).optional(),
  authorName: z.string().trim().max(80).optional(),
  authorEmail: z.string().email().optional().or(z.literal("")),
});

export type PublicResult = { error?: string; ok?: boolean };

export async function submitPostAction(_prev: PublicResult, formData: FormData): Promise<PublicResult> {
  const parsed = postSchema.safeParse({
    boardId: formData.get("boardId"),
    title: formData.get("title"),
    body: formData.get("body") || undefined,
    authorName: formData.get("authorName") || undefined,
    authorEmail: formData.get("authorEmail") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const board = (await db.select().from(schema.boards).where(eq(schema.boards.id, parsed.data.boardId)).limit(1))[0];
  if (!board) return { error: "Board not found." };

  const voterKey = await ensureVoterKey();
  const email = parsed.data.authorEmail || undefined;
  const postId = newId("post");
  await db.insert(schema.posts).values({
    id: postId,
    workspaceId: board.workspaceId,
    boardId: board.id,
    title: parsed.data.title,
    body: parsed.data.body ?? "",
    authorName: parsed.data.authorName || "Anonymous",
    authorEmail: email,
    voteCount: 1,
  });
  // The submitter implicitly upvotes their own idea.
  await db.insert(schema.votes).values({ id: newId("vote"), postId, voterKey, voterEmail: email });

  const ws = (await db.select({ slug: schema.workspaces.slug }).from(schema.workspaces).where(eq(schema.workspaces.id, board.workspaceId)).limit(1))[0];
  if (ws) revalidatePath(`/b/${ws.slug}/${board.slug}`);
  return { ok: true };
}

const commentSchema = z.object({
  postId: z.string().min(1),
  body: z.string().trim().min(1, "Write a comment").max(4000),
  authorName: z.string().trim().max(80).optional(),
  authorEmail: z.string().email().optional().or(z.literal("")),
});

export async function addCommentAction(_prev: PublicResult, formData: FormData): Promise<PublicResult> {
  const parsed = commentSchema.safeParse({
    postId: formData.get("postId"),
    body: formData.get("body"),
    authorName: formData.get("authorName") || undefined,
    authorEmail: formData.get("authorEmail") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const post = (await db.select().from(schema.posts).where(eq(schema.posts.id, parsed.data.postId)).limit(1))[0];
  if (!post) return { error: "Post not found." };

  await db.insert(schema.comments).values({
    id: newId("cmt"),
    postId: post.id,
    body: parsed.data.body,
    authorName: parsed.data.authorName || "Anonymous",
    authorEmail: parsed.data.authorEmail || undefined,
  });
  const ws = (await db.select({ slug: schema.workspaces.slug }).from(schema.workspaces).where(eq(schema.workspaces.id, post.workspaceId)).limit(1))[0];
  if (ws) revalidatePath(`/b/${ws.slug}/p/${post.id}`);
  return { ok: true };
}
