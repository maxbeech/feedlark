"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { newId } from "@/lib/ids";
import { slugify } from "@/lib/utils";
import { assertMembership } from "@/lib/auth/guard";
import { sendEmail } from "@/lib/email";
import { absoluteUrl } from "@/lib/utils";
import {
  dedupeEmails,
  shipChangelogBody,
  shipChangelogTitle,
  notifyEmailSubject,
} from "@/lib/ship-loop";

async function uniqueChangelogSlug(workspaceId: string, base: string): Promise<string> {
  const wanted = slugify(base);
  const rows = await db.select({ slug: schema.changelogEntries.slug }).from(schema.changelogEntries).where(eq(schema.changelogEntries.workspaceId, workspaceId));
  const used = new Set(rows.map((r) => r.slug));
  if (!used.has(wanted)) return wanted;
  for (let i = 2; i < 999; i++) if (!used.has(`${wanted}-${i}`)) return `${wanted}-${i}`;
  return `${wanted}-${newId("x").slice(2, 6)}`;
}

const entrySchema = z.object({
  workspaceId: z.string().min(1),
  title: z.string().trim().min(2).max(120),
  body: z.string().trim().max(8000).optional(),
  category: z.enum(["new", "improved", "fixed"]).default("new"),
});

export async function createChangelogAction(_prev: { error?: string }, formData: FormData) {
  const parsed = entrySchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    title: formData.get("title"),
    body: formData.get("body") || undefined,
    category: formData.get("category") || "new",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await assertMembership(parsed.data.workspaceId);
  const slug = await uniqueChangelogSlug(parsed.data.workspaceId, parsed.data.title);
  await db.insert(schema.changelogEntries).values({
    id: newId("log"),
    workspaceId: parsed.data.workspaceId,
    title: parsed.data.title,
    slug,
    body: parsed.data.body ?? "",
    category: parsed.data.category,
    publishedAt: Math.floor(Date.now() / 1000),
  });
  revalidatePath("/dashboard/changelog");
  const ws = (await db.select({ slug: schema.workspaces.slug }).from(schema.workspaces).where(eq(schema.workspaces.id, parsed.data.workspaceId)).limit(1))[0];
  if (ws) revalidatePath(`/b/${ws.slug}/changelog`);
  redirect("/dashboard/changelog");
}

const MAX_SHIP_NOTIFY = 500;

/**
 * THE LOOP. Mark a post Shipped: set status=complete, auto-create a published
 * changelog entry linked to the post, and notify every voter/commenter who
 * left an email. Returns how many were notified (vs only logged).
 */
export async function shipPostAction(formData: FormData) {
  const postId = String(formData.get("postId"));
  const post = (await db.select().from(schema.posts).where(eq(schema.posts.id, postId)).limit(1))[0];
  if (!post) return;
  await assertMembership(post.workspaceId);
  if (post.shippedChangelogId) return; // already shipped — idempotent no-op

  const ws = (await db.select().from(schema.workspaces).where(eq(schema.workspaces.id, post.workspaceId)).limit(1))[0];

  // Create the changelog entry, then atomically CLAIM the ship (conditional
  // update). If another concurrent ship won the race, roll back our entry.
  const slug = await uniqueChangelogSlug(post.workspaceId, post.title);
  const changelogId = newId("log");
  await db.insert(schema.changelogEntries).values({
    id: changelogId,
    workspaceId: post.workspaceId,
    title: shipChangelogTitle(post.title),
    slug,
    body: shipChangelogBody(post.title, post.voteCount),
    category: "new",
    linkedPostId: post.id,
    publishedAt: Math.floor(Date.now() / 1000),
  });
  const claim = await db
    .update(schema.posts)
    .set({ status: "complete", shippedChangelogId: changelogId })
    .where(and(eq(schema.posts.id, postId), isNull(schema.posts.shippedChangelogId)));
  if (!claim.rowsAffected) {
    await db.delete(schema.changelogEntries).where(eq(schema.changelogEntries.id, changelogId));
    return;
  }

  // Gather notify list from real votes + comments + the author (capped).
  const voteEmails = await db.select({ e: schema.votes.voterEmail }).from(schema.votes).where(eq(schema.votes.postId, postId));
  const commentEmails = await db.select({ e: schema.comments.authorEmail }).from(schema.comments).where(eq(schema.comments.postId, postId));
  const recipients = dedupeEmails([post.authorEmail, ...voteEmails.map((v) => v.e), ...commentEmails.map((c) => c.e)]).slice(0, MAX_SHIP_NOTIFY);

  if (recipients.length) {
    const link = ws ? absoluteUrl(`/b/${ws.slug}/changelog`) : absoluteUrl("/");
    const subject = notifyEmailSubject(ws?.name ?? "We", post.title);
    // Send in parallel (don't block the request on serial round-trips).
    const results = await Promise.allSettled(
      recipients.map((email) =>
        sendEmail({ to: email, subject, text: `Good news — something you asked for just shipped:\n\n${post.title}\n\nSee what's new: ${link}` }),
      ),
    );
    // One batched insert for all notification records.
    await db.insert(schema.shipNotifications).values(
      recipients.map((email, i) => ({
        id: newId("ntf"),
        workspaceId: post.workspaceId,
        postId,
        changelogId,
        recipientEmail: email,
        status: results[i].status === "fulfilled" && (results[i] as PromiseFulfilledResult<{ sent: boolean }>).value.sent ? "sent" : "logged",
      })),
    );
  }

  revalidatePath(`/dashboard/posts/${postId}`);
  revalidatePath("/dashboard/changelog");
  if (ws) {
    revalidatePath(`/b/${ws.slug}/changelog`);
    revalidatePath(`/b/${ws.slug}/roadmap`);
  }
}
