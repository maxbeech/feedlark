import { NextResponse } from "next/server";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getWorkspaceBySlug } from "@/lib/data/workspace";
import { absoluteUrl } from "@/lib/utils";

// Public JSON for the embed + GEO. CORS is opened in next.config.mjs.
export async function GET(_req: Request, { params }: { params: Promise<{ wsSlug: string }> }) {
  const { wsSlug } = await params;
  const ws = await getWorkspaceBySlug(wsSlug);
  if (!ws) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const latest = await db
    .select({ title: schema.changelogEntries.title, slug: schema.changelogEntries.slug, publishedAt: schema.changelogEntries.publishedAt })
    .from(schema.changelogEntries)
    .where(and(eq(schema.changelogEntries.workspaceId, ws.id), isNotNull(schema.changelogEntries.publishedAt)))
    .orderBy(desc(schema.changelogEntries.publishedAt))
    .limit(5);

  return NextResponse.json({
    workspace: ws.name,
    boardUrl: absoluteUrl(`/b/${ws.slug}`),
    roadmapUrl: absoluteUrl(`/b/${ws.slug}/roadmap`),
    changelogUrl: absoluteUrl(`/b/${ws.slug}/changelog`),
    latestChangelog: latest.map((l) => ({ title: l.title, url: absoluteUrl(`/b/${ws.slug}/changelog#${l.slug}`) })),
  });
}
