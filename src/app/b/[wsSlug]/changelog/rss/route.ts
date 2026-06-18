import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getWorkspaceBySlug } from "@/lib/data/workspace";
import { buildRssFeed } from "@/lib/feeds";
import { absoluteUrl } from "@/lib/utils";

export async function GET(_req: Request, { params }: { params: Promise<{ wsSlug: string }> }) {
  const { wsSlug } = await params;
  const ws = await getWorkspaceBySlug(wsSlug);
  if (!ws) return new Response("Not found", { status: 404 });

  const entries = await db
    .select()
    .from(schema.changelogEntries)
    .where(and(eq(schema.changelogEntries.workspaceId, ws.id), isNotNull(schema.changelogEntries.publishedAt)))
    .orderBy(desc(schema.changelogEntries.publishedAt))
    .limit(50);

  const xml = buildRssFeed({
    title: `${ws.name} changelog`,
    link: absoluteUrl(`/b/${ws.slug}/changelog`),
    description: `Product updates from ${ws.name}`,
    items: entries.map((e) => ({
      title: e.title,
      link: absoluteUrl(`/b/${ws.slug}/changelog#${e.slug}`),
      description: e.body || e.title,
      guid: e.id,
      pubDate: new Date((e.publishedAt ?? e.createdAt) * 1000),
    })),
  });

  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
