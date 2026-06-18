import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { MessageSquare } from "lucide-react";
import { db, schema } from "@/lib/db";
import { getWorkspaceBySlug } from "@/lib/data/workspace";
import { listBoardPosts, votedPostIds } from "@/lib/data/posts";
import { getVoterKey } from "@/lib/voter";
import { Card, StatusBadge } from "@/components/ui";
import { VoteButton } from "@/components/public/vote-button";
import { SubmitPostForm } from "@/components/public/submit-post-form";
import { statusLabel } from "@/lib/utils";
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
  const commentCounts = await Promise.all(
    posts.map(async (p) => (await db.select({ id: schema.comments.id }).from(schema.comments).where(eq(schema.comments.postId, p.id))).length),
  );

  return (
    <div>
      <Link href={`/b/${ws.slug}`} className="text-sm text-ink-muted hover:text-ink">← All boards</Link>
      <h1 className="mt-1 text-2xl font-bold text-ink">{board.name}</h1>
      {board.description && <p className="mt-1 text-ink-muted">{board.description}</p>}

      <div className="mt-5">
        <SubmitPostForm boardId={board.id} />
      </div>

      <div className="mt-4 space-y-2">
        {posts.map((p, i) => (
          <Card key={p.id} className="flex items-start gap-4 p-4">
            <VoteButton postId={p.id} initialCount={p.voteCount} initialVoted={voted.has(p.id)} />
            <div className="min-w-0 flex-1">
              <Link href={`/b/${ws.slug}/p/${p.id}`} className="font-medium text-ink hover:text-brand-700">
                {p.title}
              </Link>
              {p.body && <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{p.body}</p>}
              <div className="mt-2 flex items-center gap-3 text-xs text-ink-muted">
                <StatusBadge status={p.status} label={statusLabel(p.status)} />
                <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {commentCounts[i]}</span>
                {p.shippedChangelogId && <span className="font-medium text-emerald-700">✓ Shipped</span>}
              </div>
            </div>
          </Card>
        ))}
        {posts.length === 0 && <Card className="p-10 text-center text-ink-muted">No ideas yet — be the first to suggest one!</Card>}
      </div>
    </div>
  );
}
