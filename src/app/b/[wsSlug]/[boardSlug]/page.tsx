import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getWorkspaceBySlug } from "@/lib/data/workspace";
import { listBoardPosts, votedPostIds } from "@/lib/data/posts";
import { getVoterKey } from "@/lib/voter";
import { SubmitPostForm } from "@/components/public/submit-post-form";
import { BoardPostList } from "@/components/public/board-post-list";
import { pageMetadata } from "@/lib/seo";

async function load(wsSlug: string, boardSlug: string) {
  const ws = await getWorkspaceBySlug(wsSlug);
  if (!ws) return null;
  const board = (await db.select().from(schema.boards).where(and(eq(schema.boards.workspaceId, ws.id), eq(schema.boards.slug, boardSlug))).limit(1))[0];
  if (!board || board.isPrivate) return null;
  return { ws, board };
}

export async function generateMetadata({ params }: { params: Promise<{ wsSlug: string; boardSlug: string }> }): Promise<Metadata> {
  const { wsSlug, boardSlug } = await params;
  const data = await load(wsSlug, boardSlug);
  if (!data) return {};
  return pageMetadata({
    title: `${data.board.name} · ${data.ws.name}`,
    description: data.board.description || `Vote on ${data.board.name} ideas for ${data.ws.name}.`,
    path: `/b/${data.ws.slug}/${data.board.slug}`,
  });
}

export default async function BoardPage({ params }: { params: Promise<{ wsSlug: string; boardSlug: string }> }) {
  const { wsSlug, boardSlug } = await params;
  const data = await load(wsSlug, boardSlug);
  if (!data) notFound();
  const { ws, board } = data;

  const posts = await listBoardPosts(board.id);
  const voterKey = await getVoterKey();
  const voted = await votedPostIds(voterKey, posts.map((p) => p.id));

  // Comment counts in one grouped query (no N+1).
  const commentRows = await db
    .select({ postId: schema.comments.postId, n: sql<number>`count(*)` })
    .from(schema.comments)
    .where(and(inArray(schema.comments.postId, posts.length ? posts.map((p) => p.id) : ["__none__"]), eq(schema.comments.isInternal, false)))
    .groupBy(schema.comments.postId);
  const commentCounts: Record<string, number> = Object.fromEntries(commentRows.map((r) => [r.postId, Number(r.n)]));

  return (
    <div>
      <Link href={`/b/${ws.slug}`} className="text-sm text-ink-muted hover:text-ink">← All boards</Link>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tightest text-ink">{board.name}</h1>
      {board.description && <p className="mt-1 text-ink-muted">{board.description}</p>}

      <div className="mt-5">
        <SubmitPostForm boardId={board.id} />
      </div>

      <div className="mt-6">
        <BoardPostList posts={posts} votedIds={[...voted]} wsSlug={ws.slug} commentCounts={commentCounts} />
      </div>
    </div>
  );
}
