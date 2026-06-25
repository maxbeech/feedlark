import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ensureVoterKey } from "@/lib/voter";
import { newId } from "@/lib/ids";
import { isValidEmail } from "@/lib/utils";
import { revalidatePublicWorkspace } from "@/lib/revalidate";
import { checkRateLimit, clientIp } from "@/lib/ratelimit";

/**
 * Toggle a vote (or attach a notify-email). The vote count is recomputed
 * authoritatively from COUNT(votes) on every call, so the denormalized
 * posts.vote_count can never drift and concurrent races self-heal. The unique
 * index (post_id, voter_key) is the source of truth; a racing duplicate insert
 * is caught and treated as "already voted".
 */
export async function POST(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  // Per-IP cap blunts vote-stuffing by cookie-clearing/scripting.
  if (!(await checkRateLimit("vote", await clientIp()))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const voterKey = await ensureVoterKey();

  const postRows = await db.select().from(schema.posts).where(eq(schema.posts.id, postId)).limit(1);
  const post = postRows[0];
  if (!post) return NextResponse.json({ error: "not_found" }, { status: 404 });

  let email: string | undefined;
  try {
    const body = await req.json();
    if (typeof body?.email === "string" && isValidEmail(body.email)) email = body.email.toLowerCase().trim();
  } catch {
    /* no body is fine */
  }

  const existing = await db
    .select({ id: schema.votes.id })
    .from(schema.votes)
    .where(and(eq(schema.votes.postId, postId), eq(schema.votes.voterKey, voterKey)))
    .limit(1);

  let voted: boolean;
  if (email) {
    // "Notify me / subscribe" — always results in a vote, never removes one.
    if (existing.length) {
      await db.update(schema.votes).set({ voterEmail: email }).where(eq(schema.votes.id, existing[0].id));
    } else {
      try {
        await db.insert(schema.votes).values({ id: newId("vote"), postId, voterKey, voterEmail: email });
      } catch {
        /* unique race — already voted */
      }
    }
    voted = true;
  } else if (existing.length) {
    await db.delete(schema.votes).where(eq(schema.votes.id, existing[0].id));
    voted = false;
  } else {
    try {
      await db.insert(schema.votes).values({ id: newId("vote"), postId, voterKey });
      voted = true;
    } catch {
      voted = true; // unique race: a vote already exists
    }
  }

  // Authoritative recount — eliminates drift regardless of races above.
  const counted = await db
    .select({ c: sql<number>`count(*)` })
    .from(schema.votes)
    .where(eq(schema.votes.postId, postId));
  const count = Number(counted[0]?.c ?? 0);
  await db.update(schema.posts).set({ voteCount: count }).where(eq(schema.posts.id, postId));

  // Refresh ISR-cached public surfaces that show this post's count.
  const ws = (await db.select({ slug: schema.workspaces.slug }).from(schema.workspaces).where(eq(schema.workspaces.id, post.workspaceId)).limit(1))[0];
  if (ws) {
    revalidatePublicWorkspace(ws.slug);
    revalidatePath(`/b/${ws.slug}/p/${postId}`);
  }

  return NextResponse.json({ count, voted });
}
