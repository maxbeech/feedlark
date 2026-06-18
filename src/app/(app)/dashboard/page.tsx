import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { Plus, MessageSquare, Lock } from "lucide-react";
import { db, schema } from "@/lib/db";
import { requireWorkspaceContext } from "@/lib/auth/guard";
import { boardPostCounts } from "@/lib/data/posts";
import { LinkButton, Card, Badge } from "@/components/ui";
import { absoluteUrl } from "@/lib/utils";

export default async function DashboardHome() {
  const { workspace } = await requireWorkspaceContext();
  const boards = await db
    .select()
    .from(schema.boards)
    .where(eq(schema.boards.workspaceId, workspace.id))
    .orderBy(schema.boards.sortOrder, desc(schema.boards.createdAt));

  const countMap = await boardPostCounts(workspace.id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Boards</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Public at <span className="font-mono text-ink-soft">{absoluteUrl(`/b/${workspace.slug}`)}</span>
          </p>
        </div>
        <LinkButton href="/dashboard/boards/new"><Plus className="h-4 w-4" /> New board</LinkButton>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {boards.map((b) => (
          <Link key={b.id} href={`/dashboard/boards/${b.id}`}>
            <Card className="h-full p-5 transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-ink">{b.name}</h2>
                {b.isPrivate && <Badge className="bg-slate-100 text-slate-600"><Lock className="mr-1 h-3 w-3" /> Private</Badge>}
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{b.description || "No description"}</p>
              <div className="mt-4 flex items-center gap-1 text-sm text-ink-soft">
                <MessageSquare className="h-4 w-4" /> {countMap[b.id] ?? 0} posts
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {boards.length === 0 && (
        <Card className="mt-6 p-10 text-center text-ink-muted">
          No boards yet. Create your first board to start collecting feedback.
        </Card>
      )}
    </div>
  );
}
