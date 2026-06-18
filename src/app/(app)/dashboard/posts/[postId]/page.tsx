import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Rocket, Pin } from "lucide-react";
import { db, schema } from "@/lib/db";
import { requireWorkspaceContext } from "@/lib/auth/guard";
import { listComments } from "@/lib/data/posts";
import { Card, Button, Textarea, StatusBadge } from "@/components/ui";
import { StatusControl } from "@/components/dashboard/status-control";
import { ConfirmSubmit } from "@/components/dashboard/confirm-submit";
import { EditPostForm } from "@/components/dashboard/edit-forms";
import { togglePinAction, adminReplyAction } from "@/lib/actions/admin";
import { shipPostAction as shipAction } from "@/lib/actions/changelog";
import { deletePostAction, deleteCommentAction } from "@/lib/actions/moderation";
import { statusLabel, timeAgo } from "@/lib/utils";

export default async function PostManagePage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const { workspace } = await requireWorkspaceContext();
  const post = (await db.select().from(schema.posts).where(eq(schema.posts.id, postId)).limit(1))[0];
  if (!post || post.workspaceId !== workspace.id) notFound();

  const board = (await db.select().from(schema.boards).where(eq(schema.boards.id, post.boardId)).limit(1))[0];
  const comments = await listComments(postId);
  const notifs = await db.select().from(schema.shipNotifications).where(eq(schema.shipNotifications.postId, postId));
  const shipped = post.status === "complete" && post.shippedChangelogId;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={board ? `/dashboard/boards/${board.id}` : "/dashboard"} className="text-sm text-ink-muted hover:text-ink">← {board?.name ?? "Board"}</Link>

      <Card className="mt-3 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-ink">{post.title}</h1>
            <p className="mt-1 text-sm text-ink-muted">{post.voteCount} votes · by {post.authorName} · {timeAgo(post.createdAt)}</p>
          </div>
          <StatusBadge status={post.status} label={statusLabel(post.status)} />
        </div>
        {post.body && <p className="mt-4 whitespace-pre-wrap text-ink-soft">{post.body}</p>}

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
          <StatusControl postId={post.id} status={post.status} />
          <form action={togglePinAction}>
            <input type="hidden" name="postId" value={post.id} />
            <Button type="submit" variant="outline" size="sm"><Pin className="h-3.5 w-3.5" /> {post.pinned ? "Unpin" : "Pin"}</Button>
          </form>
          {!shipped && (
            <form action={shipAction}>
              <input type="hidden" name="postId" value={post.id} />
              <Button type="submit" size="sm"><Rocket className="h-3.5 w-3.5" /> Ship it</Button>
            </form>
          )}
          <EditPostForm postId={post.id} title={post.title} body={post.body} />
          <ConfirmSubmit action={deletePostAction} fields={{ postId: post.id }} label="Delete" confirmMessage="Delete this post and all its votes/comments? This cannot be undone." />
        </div>

        {shipped && (
          <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
            ✓ Shipped — changelog published.{" "}
            {notifs.length > 0
              ? `${notifs.length} ${notifs.length === 1 ? "person" : "people"} who asked were notified (${notifs.filter((n) => n.status === "sent").length} emailed${notifs.some((n) => n.status === "logged") ? ", rest queued" : ""}).`
              : "No voters left an email to notify."}
          </div>
        )}
      </Card>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-ink-muted">Comments ({comments.length})</h2>
      <div className="mt-3 space-y-3">
        {comments.map((c) => (
          <Card key={c.id} className={`p-4 ${c.isAdmin ? "border-brand-200 bg-brand-50/40" : ""}`}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-ink">{c.authorName}{c.isAdmin && <span className="ml-2 rounded bg-brand-600 px-1.5 py-0.5 text-xs text-white">Team</span>}</p>
              <ConfirmSubmit action={deleteCommentAction} fields={{ commentId: c.id }} label="Delete" confirmMessage="Delete this comment?" variant="ghost" />
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-ink-soft">{c.body}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-4 p-4">
        <form action={adminReplyAction} className="space-y-3">
          <input type="hidden" name="postId" value={post.id} />
          <Textarea name="body" rows={2} placeholder="Reply as the team…" required />
          <Button type="submit" size="sm">Post reply</Button>
        </form>
      </Card>
    </div>
  );
}
