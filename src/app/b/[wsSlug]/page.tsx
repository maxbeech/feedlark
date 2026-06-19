import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq, desc } from "drizzle-orm";
import { MessageSquare, ArrowRight } from "lucide-react";
import { db, schema } from "@/lib/db";
import { getWorkspaceBySlug } from "@/lib/data/workspace";
import { boardPostCounts } from "@/lib/data/posts";
import { Card } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";

// ISR: cached at the edge, refreshed in the background; writes call revalidatePath.
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ wsSlug: string }> }): Promise<Metadata> {
  const { wsSlug } = await params;
  const ws = await getWorkspaceBySlug(wsSlug);
  if (!ws) return {};
  return pageMetadata({
    title: `${ws.name} feedback & roadmap`,
    description: `Share feature requests for ${ws.name}, vote on ideas and follow the public roadmap.`,
    path: `/b/${ws.slug}`,
  });
}

export default async function PublicWorkspaceHome({ params }: { params: Promise<{ wsSlug: string }> }) {
  const { wsSlug } = await params;
  const ws = await getWorkspaceBySlug(wsSlug);
  if (!ws) notFound();

  const boards = await db
    .select()
    .from(schema.boards)
    .where(and(eq(schema.boards.workspaceId, ws.id), eq(schema.boards.isPrivate, false)))
    .orderBy(schema.boards.sortOrder, desc(schema.boards.createdAt));

  const countMap = await boardPostCounts(ws.id);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tightest text-ink">Help shape {ws.name}</h1>
      <p className="mt-1 text-ink-muted">Pick a board, share an idea, or upvote what matters most to you.</p>

      <div className="mt-8 space-y-3">
        {boards.map((b) => (
          <Link key={b.id} href={`/b/${ws.slug}/${b.slug}`} className="group block">
            <Card className="flex items-center justify-between p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift">
              <div>
                <h2 className="font-display text-lg font-semibold text-ink">{b.name}</h2>
                <p className="text-sm text-ink-muted">{b.description || "Share your feedback"}</p>
                <p className="mt-1.5 flex items-center gap-1 text-xs text-ink-muted"><MessageSquare className="h-3.5 w-3.5" /> <span className="tabular">{countMap[b.id] ?? 0}</span> ideas</p>
              </div>
              <ArrowRight className="h-5 w-5 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" />
            </Card>
          </Link>
        ))}
        {boards.length === 0 && <Card className="p-10 text-center text-ink-muted">No public boards yet.</Card>}
      </div>
    </div>
  );
}
