"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { newId } from "@/lib/ids";
import { slugify } from "@/lib/utils";
import { revalidatePublicWorkspace } from "@/lib/revalidate";
import { POST_STATUSES } from "@/lib/db/schema";
import { assertMembership } from "@/lib/auth/guard";
import { limitsFor } from "@/lib/plans";

async function uniqueBoardSlug(workspaceId: string, base: string): Promise<string> {
  const wanted = slugify(base);
  const existing = await db.select({ slug: schema.boards.slug }).from(schema.boards).where(eq(schema.boards.workspaceId, workspaceId));
  const used = new Set(existing.map((b) => b.slug));
  if (!used.has(wanted)) return wanted;
  for (let i = 2; i < 999; i++) if (!used.has(`${wanted}-${i}`)) return `${wanted}-${i}`;
  return `${wanted}-${newId("x").slice(2, 6)}`;
}

const boardSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().trim().min(2, "Board needs a name").max(60),
  description: z.string().trim().max(280).optional(),
  isPrivate: z.coerce.boolean().optional(),
});

export async function createBoardAction(_prev: { error?: string }, formData: FormData) {
  const parsed = boardSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    isPrivate: formData.get("isPrivate") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const ws = (await db.select().from(schema.workspaces).where(eq(schema.workspaces.id, parsed.data.workspaceId)).limit(1))[0];
  await assertMembership(parsed.data.workspaceId);
  if (!ws) return { error: "Workspace not found." };

  const isPrivate = parsed.data.isPrivate ?? false;
  if (isPrivate && !limitsFor(ws.plan).canPrivateBoards) {
    return { error: "Private boards are a Pro feature. Upgrade in Settings." };
  }

  const slug = await uniqueBoardSlug(ws.id, parsed.data.name);
  await db.insert(schema.boards).values({
    id: newId("brd"),
    workspaceId: ws.id,
    name: parsed.data.name,
    slug,
    description: parsed.data.description ?? "",
    isPrivate,
  });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function setPostStatusAction(formData: FormData) {
  const postId = String(formData.get("postId"));
  const status = String(formData.get("status"));
  if (!POST_STATUSES.includes(status as never)) return;
  // "complete" is reserved for the ship-loop (the "Ship it" button), which also
  // writes the changelog + shippedChangelogId. Setting it directly here would
  // show a post as "Shipped" with no changelog behind it, so we forbid it.
  if (status === "complete") return;
  const post = (await db.select().from(schema.posts).where(eq(schema.posts.id, postId)).limit(1))[0];
  if (!post) return;
  await assertMembership(post.workspaceId);
  // Re-opening a shipped post: drop the changelog link so the loop can run again.
  const reopening = post.status === "complete" && post.shippedChangelogId;
  await db
    .update(schema.posts)
    .set(reopening ? { status, shippedChangelogId: null } : { status })
    .where(eq(schema.posts.id, postId));
  revalidatePath(`/dashboard/posts/${postId}`);
  revalidatePath("/dashboard");
  const ws = (await db.select({ slug: schema.workspaces.slug }).from(schema.workspaces).where(eq(schema.workspaces.id, post.workspaceId)).limit(1))[0];
  if (ws) revalidatePublicWorkspace(ws.slug);
}

export async function togglePinAction(formData: FormData) {
  const postId = String(formData.get("postId"));
  const post = (await db.select().from(schema.posts).where(eq(schema.posts.id, postId)).limit(1))[0];
  if (!post) return;
  await assertMembership(post.workspaceId);
  await db.update(schema.posts).set({ pinned: !post.pinned }).where(eq(schema.posts.id, postId));
  revalidatePath(`/dashboard/posts/${postId}`);
}

export async function adminReplyAction(formData: FormData) {
  const postId = String(formData.get("postId"));
  const body = String(formData.get("body") || "").trim();
  if (!body) return;
  const post = (await db.select().from(schema.posts).where(eq(schema.posts.id, postId)).limit(1))[0];
  if (!post) return;
  const user = await assertMembership(post.workspaceId);
  await db.insert(schema.comments).values({
    id: newId("cmt"),
    postId,
    body,
    authorName: user.name || "Team",
    authorEmail: user.email,
    isAdmin: true,
  });
  revalidatePath(`/dashboard/posts/${postId}`);
}

const settingsSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().trim().min(1).max(80),
  accentColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #f97316")
    .optional()
    .or(z.literal("")),
});

export async function updateWorkspaceAction(_prev: { error?: string; ok?: boolean }, formData: FormData) {
  const parsed = settingsSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    name: formData.get("name"),
    accentColor: formData.get("accentColor") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await assertMembership(parsed.data.workspaceId);
  await db
    .update(schema.workspaces)
    .set({ name: parsed.data.name, accentColor: parsed.data.accentColor || "#f97316" })
    .where(eq(schema.workspaces.id, parsed.data.workspaceId));
  revalidatePath("/dashboard/settings");
  return { ok: true };
}

const domainSchema = z.object({ workspaceId: z.string().min(1), customDomain: z.string().trim().max(120).optional().or(z.literal("")) });

export async function updateCustomDomainAction(_prev: { error?: string; ok?: boolean }, formData: FormData) {
  const parsed = domainSchema.safeParse({ workspaceId: formData.get("workspaceId"), customDomain: formData.get("customDomain") || undefined });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const ws = (await db.select().from(schema.workspaces).where(eq(schema.workspaces.id, parsed.data.workspaceId)).limit(1))[0];
  await assertMembership(parsed.data.workspaceId);
  if (!ws) return { error: "Workspace not found." };
  if (!limitsFor(ws.plan).canCustomDomain) return { error: "Custom domains are a Pro feature." };

  const domain = (parsed.data.customDomain || "").toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();
  if (domain && !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) return { error: "Enter a valid domain like feedback.yourcompany.com" };
  if (domain) {
    // A domain can only route to one workspace — refuse to hijack another's.
    const clash = (await db
      .select({ id: schema.workspaces.id })
      .from(schema.workspaces)
      .where(and(eq(schema.workspaces.customDomain, domain), ne(schema.workspaces.id, ws.id)))
      .limit(1))[0];
    if (clash) return { error: "That domain is already connected to another Feedlark workspace." };
  }
  await db.update(schema.workspaces).set({ customDomain: domain || null }).where(eq(schema.workspaces.id, ws.id));
  revalidatePath("/dashboard/settings");
  return { ok: true };
}
