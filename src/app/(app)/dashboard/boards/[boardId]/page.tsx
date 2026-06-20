import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ChevronUp, MessageSquare, Pin, Download, Layers } from "lucide-react";
import { db, schema } from "@/lib/db";
import { requireWorkspaceContext } from "@/lib/auth/guard";
import { listBoardPosts } from "@/lib/data/posts";
import { clusterDuplicates } from "@/lib/dedupe";
import { Card, StatusBadge, LinkButton, buttonClass } from "@/components/ui";
import { ConfirmSubmit } from "@/components/dashboard/confirm-submit";
import { EditBoardForm } from "@/components/dashboard/edit-forms";
import { deleteBoardAction } from "@/lib/actions/moderation";
import { mergePostsAction } from "@/lib/actions/merge";
import { statusLabel, absoluteUrl } from "@/lib/utils";

export default async function BoardManagePage({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;
  const { workspace } = await requireWorkspaceContext();
  const board = (await db.select().from(schema.boards).where(eq(schema.boards.id, boardId)).limit(1))[0];
  if (!board || board.workspaceId !== workspace.id) notFound();

  const isPro = workspace.plan === "pro";
  const posts = await listBoardPosts(boardId, { includeClosed: true });
  const byId = new Map(posts.map((p) => [p.id, p]));
  // Detected duplicate groups, each ordered with the highest-voted post first.
  const clusters = (isPro ? clusterDuplicates(posts.map((p) => ({ id: p.id, title: p.title }))) : [])
    .map((g) => g.map((item) => byId.get(item.id)!).filter(Boolean).sort((a, b) => b.voteCount - a.voteCount))
    .filter((g) => g.length >= 2);

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <Link href="/dashboard" className="text-sm text-ink-muted hover:text-ink">← Boards</Link>
          <h1 className="mt-1 truncate font-display text-2xl font-semibold tracking-tightest text-ink">{board.name}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isPro && <a href={`/dashboard/boards/${board.id}/export`} className={buttonClass("outline", "sm")}><Download className="h-3.5 w-3.5" /> Export CSV</a>}
          <LinkButton href={absoluteUrl(`/b/${workspace.slug}/${board.slug}`)} variant="outline" size="sm">View public ↗</LinkButton>
          <ConfirmSubmit action={deleteBoardAction} fields={{ boardId: board.id }} label="Delete" confirmMessage={`Delete "${board.name}" and all its posts? This cannot be undone.`} variant="ghost" />
        </div>
      </div>
      <EditBoardForm boardId={board.id} name={board.name} description={board.description} />

      {clusters.map((group, i) => {
        const [target, ...sources] = group;
        return (
          <Card key={i} className="mt-6 border-amber-200 bg-amber-50/50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-amber-900"><Layers className="h-4 w-4" /> {group.length} similar requests</p>
            <ul className="mt-2 space-y-1 text-sm text-amber-800">
              {group.map((g) => <li key={g.id}>{g.title} <span className="text-amber-600">({g.voteCount})</span></li>)}
            </ul>
            <div className="mt-3">
              <ConfirmSubmit
                action={mergePostsAction}
                fields={{ targetId: target.id, sourceIds: sources.map((s) => s.id).join(",") }}
                label={`Merge ${sources.length} into "${target.title.slice(0, 24)}${target.title.length > 24 ? "…" : ""}"`}
                confirmMessage={`Merge ${sources.length} duplicate${sources.length > 1 ? "s" : ""} into "${target.title}"? Votes and comments move across and the duplicates are deleted.`}
                variant="outline"
              />
            </div>
          </Card>
        );
      })}

      <div className="mt-6 space-y-2">
        {posts.map((p) => (
          <Link key={p.id} href={`/dashboard/posts/${p.id}`}>
            <Card className="flex items-center gap-4 p-4 transition-shadow hover:shadow-lift">
              <div className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-cream py-1.5 text-ink">
                <ChevronUp className="h-4 w-4 text-brand-500" />
                <span className="text-sm font-semibold tabular">{p.voteCount}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-ink">{p.title}</p>
                  {p.pinned && <Pin className="h-3.5 w-3.5 shrink-0 text-brand-600" />}
                </div>
                <p className="truncate text-sm text-ink-muted">{p.body || "No description"}</p>
              </div>
              <StatusBadge status={p.status} label={statusLabel(p.status)} />
            </Card>
          </Link>
        ))}
        {posts.length === 0 && <Card className="p-10 text-center text-ink-muted">No posts yet. Share your board link to start collecting feedback.</Card>}
      </div>
    </div>
  );
}
