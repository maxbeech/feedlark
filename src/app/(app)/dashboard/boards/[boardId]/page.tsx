import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ChevronUp, MessageSquare } from "lucide-react";
import { db, schema } from "@/lib/db";
import { requireWorkspaceContext } from "@/lib/auth/guard";
import { listBoardPosts } from "@/lib/data/posts";
import { clusterDuplicates } from "@/lib/dedupe";
import { Card, StatusBadge, LinkButton } from "@/components/ui";
import { ConfirmSubmit } from "@/components/dashboard/confirm-submit";
import { EditBoardForm } from "@/components/dashboard/edit-forms";
import { deleteBoardAction } from "@/lib/actions/moderation";
import { statusLabel, absoluteUrl } from "@/lib/utils";

export default async function BoardManagePage({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;
  const { workspace } = await requireWorkspaceContext();
  const board = (await db.select().from(schema.boards).where(eq(schema.boards.id, boardId)).limit(1))[0];
  if (!board || board.workspaceId !== workspace.id) notFound();

  const posts = await listBoardPosts(boardId, { includeClosed: true });
  const dupeClusters = workspace.plan === "pro" ? clusterDuplicates(posts.map((p) => ({ id: p.id, title: p.title }))) : [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-ink-muted hover:text-ink">← Boards</Link>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tightest text-ink">{board.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <LinkButton href={absoluteUrl(`/b/${workspace.slug}/${board.slug}`)} variant="outline" size="sm">View public ↗</LinkButton>
          <ConfirmSubmit action={deleteBoardAction} fields={{ boardId: board.id }} label="Delete board" confirmMessage={`Delete "${board.name}" and all its posts? This cannot be undone.`} variant="ghost" />
        </div>
      </div>
      <EditBoardForm boardId={board.id} name={board.name} description={board.description} />

      {dupeClusters.length > 0 && (
        <Card className="mt-6 border-amber-200 bg-amber-50/50 p-4">
          <p className="text-sm font-semibold text-amber-900">⚠️ {dupeClusters.length} group{dupeClusters.length > 1 ? "s" : ""} of similar requests detected</p>
          <ul className="mt-2 space-y-1 text-sm text-amber-800">
            {dupeClusters.slice(0, 5).map((group, i) => (
              <li key={i}>{group.map((g) => g.title).join("  ·  ")}</li>
            ))}
          </ul>
        </Card>
      )}

      <div className="mt-6 space-y-2">
        {posts.map((p) => (
          <Link key={p.id} href={`/dashboard/posts/${p.id}`}>
            <Card className="flex items-center gap-4 p-4 transition-shadow hover:shadow-lift">
              <div className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-cream py-1.5 text-ink">
                <ChevronUp className="h-4 w-4 text-brand-500" />
                <span className="text-sm font-semibold">{p.voteCount}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-ink">{p.title}</p>
                  {p.pinned && <span className="text-xs text-brand-600">📌</span>}
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
