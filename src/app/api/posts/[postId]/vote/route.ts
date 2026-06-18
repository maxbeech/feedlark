import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { ensureVoterKey } from "@/lib/voter";
import { newId } from "@/lib/ids";

export async function POST(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const voterKey = await ensureVoterKey();

  const postRows = await db.select().from(schema.posts).where(eq(schema.posts.id, postId)).limit(1);
  const post = postRows[0];
  if (!post) return NextResponse.json({ error: "not_found" }, { status: 404 });

  let email: string | undefined;
  try {
    const body = await req.json();
    if (typeof body?.email === "string" && body.email.includes("@")) email = body.email.toLowerCase();
  } catch {
    /* no body is fine */
  }

  const existing = await db
    .select({ id: schema.votes.id })
    .from(schema.votes)
    .where(and(eq(schema.votes.postId, postId), eq(schema.votes.voterKey, voterKey)))
    .limit(1);

  let voted: boolean;
  if (existing.length) {
    if (email) {
      await db.update(schema.votes).set({ voterEmail: email }).where(eq(schema.votes.id, existing[0].id));
      voted = true;
    } else {
      await db.delete(schema.votes).where(eq(schema.votes.id, existing[0].id));
      await db
        .update(schema.posts)
        .set({ voteCount: sql`max(${schema.posts.voteCount} - 1, 0)` })
        .where(eq(schema.posts.id, postId));
      voted = false;
    }
  } else {
    await db.insert(schema.votes).values({ id: newId("vote"), postId, voterKey, voterEmail: email });
    await db
      .update(schema.posts)
      .set({ voteCount: sql`${schema.posts.voteCount} + 1` })
      .where(eq(schema.posts.id, postId));
    voted = true;
  }

  const fresh = await db.select({ c: schema.posts.voteCount }).from(schema.posts).where(eq(schema.posts.id, postId)).limit(1);
  return NextResponse.json({ count: fresh[0]?.c ?? 0, voted });
}
