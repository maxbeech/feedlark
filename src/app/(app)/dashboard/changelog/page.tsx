import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireWorkspaceContext } from "@/lib/auth/guard";
import { Card, Badge } from "@/components/ui";
import { NewChangelogForm } from "@/components/dashboard/new-changelog-form";
import { timeAgo, absoluteUrl } from "@/lib/utils";

const catColor: Record<string, string> = {
  new: "bg-emerald-100 text-emerald-800",
  improved: "bg-blue-100 text-blue-800",
  fixed: "bg-amber-100 text-amber-800",
};

export default async function ChangelogAdminPage() {
  const { workspace } = await requireWorkspaceContext();
  const entries = await db
    .select()
    .from(schema.changelogEntries)
    .where(eq(schema.changelogEntries.workspaceId, workspace.id))
    .orderBy(desc(schema.changelogEntries.publishedAt), desc(schema.changelogEntries.createdAt));

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink">Changelog</h1>
          <a href={absoluteUrl(`/b/${workspace.slug}/changelog`)} target="_blank" rel="noreferrer" className="text-sm font-medium text-brand-600">View public ↗</a>
        </div>
        <div className="mt-6 space-y-3">
          {entries.map((e) => (
            <Card key={e.id} className="p-5">
              <div className="flex items-center gap-2">
                <Badge className={catColor[e.category] ?? catColor.new}>{e.category}</Badge>
                {e.linkedPostId && <Badge className="bg-brand-100 text-brand-700">You asked → We shipped</Badge>}
                <span className="ml-auto text-xs text-ink-muted">{e.publishedAt ? timeAgo(e.publishedAt) : "draft"}</span>
              </div>
              <h2 className="mt-2 font-semibold text-ink">{e.title}</h2>
              {e.body && <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{e.body}</p>}
            </Card>
          ))}
          {entries.length === 0 && <Card className="p-10 text-center text-ink-muted">No changelog entries yet. Publish your first update — or ship a roadmap item to auto-generate one.</Card>}
        </div>
      </div>
      <NewChangelogForm workspaceId={workspace.id} />
    </div>
  );
}
