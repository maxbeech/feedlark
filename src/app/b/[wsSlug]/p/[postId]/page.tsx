import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getWorkspaceBySlug } from "@/lib/data/workspace";
import { listComments, votedPostIds } from "@/lib/data/posts";
import { getVoterKey } from "@/lib/voter";
import { Card, StatusBadge } from "@/components/ui";
import { VoteButton } from "@/components/public/vote-button";
import { CommentForm } from "@/components/public/comment-form";
import { statusLabel, timeAgo } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

async function load(wsSlug: string, postId: string) {
  const ws = await getWorkspaceBySlug(wsSlug);
  if (!ws) return null;
  const post = (await db.select().from(schema.posts).where(eq(schema.posts.id, postId)).limit(1))[0];
  if (!post || post.workspaceId !== ws.id) return null;
  return { ws, post };
}

export async function generateMetadata({ params }: { params: Promise<{ wsSlug: string; postId: string }> }): Promise<Metadata> {
  const { wsSlug, postId } = await params;
  const data = await load(wsSlug, postId);
  if (!data) return {};
  return pageMetadata({
    title: `${data.post.title} · ${data.ws.name}`,
    description: (data.post.body || data.post.title).slice(0, 155),
    path: `/b/${data.ws.slug}/p/${data.post.id}`,
  });
}

export default async function PostDetailPage({ params }: { params: Promise<{ wsSlug: string; postId: string }> }) {
  const { wsSlug, postId } = await params;
  const data = await load(wsSlug, postId);
  if (!data) notFound();
  const { ws, post } = data;

  const comments = await listComments(post.id);
  const voterKey = await getVoterKey();
  const voted = await votedPostIds(voterKey, [post.id]);
  const changelog = post.shippedChangelogId
    ? (await db.select().from(schema.changelogEntries).where(eq(schema.changelogEntries.id, post.shippedChangelogId)).limit(1))[0]
    : null;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={`/b/${ws.slug}`} className="text-sm text-ink-muted hover:text-ink">← Back to feedback</Link>

      <Card className="mt-3 flex items-start gap-4 p-6">
        <VoteButton postId={post.id} initialCount={post.voteCount} initialVoted={voted.has(post.id)} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={post.status} label={statusLabel(post.status)} />
            <span className="text-xs text-ink-muted">by {post.authorName} · {timeAgo(post.createdAt)}</span>
          </div>
          <h1 className="mt-2 text-xl font-bold text-ink">{post.title}</h1>
          {post.body && <p className="mt-3 whitespace-pre-wrap text-ink-soft">{post.body}</p>}
          {changelog && (
            <Link href={`/b/${ws.slug}/changelog#${changelog.slug}`} className="mt-4 block rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              ✓ You asked → We shipped this. Read the changelog →
            </Link>
          )}
        </div>
      </Card>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-ink-muted">{comments.length} comments</h2>
      <div className="mt-3 space-y-3">
        {comments.map((c) => (
          <Card key={c.id} className={`p-4 ${c.isAdmin ? "border-brand-200 bg-brand-50/40" : ""}`}>
            <p className="text-sm font-medium text-ink">
              {c.authorName}
              {c.isAdmin && <span className="ml-2 rounded bg-brand-600 px-1.5 py-0.5 text-xs text-white">Team</span>}
              <span className="ml-2 text-xs font-normal text-ink-muted">{timeAgo(c.createdAt)}</span>
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-ink-soft">{c.body}</p>
          </Card>
        ))}
      </div>

      <div className="mt-4">
        <CommentForm postId={post.id} />
      </div>
    </div>
  );
}
