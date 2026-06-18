import "server-only";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { newId } from "@/lib/ids";
import { isReservedSlug, slugify } from "@/lib/utils";

export async function slugAvailable(slug: string): Promise<boolean> {
  if (isReservedSlug(slug) || slug.length < 2) return false;
  const rows = await db.select({ id: schema.workspaces.id }).from(schema.workspaces).where(eq(schema.workspaces.slug, slug)).limit(1);
  return rows.length === 0;
}

/** Derive a unique, non-reserved workspace slug from a desired base. */
export async function uniqueWorkspaceSlug(base: string): Promise<string> {
  let candidate = slugify(base);
  if (isReservedSlug(candidate)) candidate = `${candidate}-team`;
  if (await slugAvailable(candidate)) return candidate;
  for (let i = 2; i < 1000; i++) {
    const next = `${candidate}-${i}`;
    if (await slugAvailable(next)) return next;
  }
  return `${candidate}-${newId("x").slice(2, 8)}`;
}

/**
 * Creates a workspace + a default board for a new user, and records the owner
 * membership. Returns the workspace.
 */
export async function createWorkspaceForUser(userId: string, name: string, desiredSlug: string) {
  const slug = await uniqueWorkspaceSlug(desiredSlug);
  const wsId = newId("ws");
  await db.insert(schema.workspaces).values({ id: wsId, ownerId: userId, name, slug });
  await db.insert(schema.workspaceMembers).values({ id: newId("mem"), workspaceId: wsId, userId, role: "owner" });
  await db.insert(schema.boards).values({
    id: newId("brd"),
    workspaceId: wsId,
    name: "Feature Requests",
    slug: "feature-requests",
    description: "Tell us what would make this product better.",
  });
  const rows = await db.select().from(schema.workspaces).where(eq(schema.workspaces.id, wsId)).limit(1);
  return rows[0];
}

/** The workspace the user owns or is a member of (first one). */
export async function getWorkspaceForUser(userId: string) {
  const rows = await db
    .select({ ws: schema.workspaces })
    .from(schema.workspaceMembers)
    .innerJoin(schema.workspaces, eq(schema.workspaceMembers.workspaceId, schema.workspaces.id))
    .where(eq(schema.workspaceMembers.userId, userId))
    .limit(1);
  return rows[0]?.ws ?? null;
}

export async function getWorkspaceBySlug(slug: string) {
  const rows = await db.select().from(schema.workspaces).where(eq(schema.workspaces.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function userIsMember(userId: string, workspaceId: string): Promise<boolean> {
  const rows = await db
    .select({ id: schema.workspaceMembers.id })
    .from(schema.workspaceMembers)
    .where(and(eq(schema.workspaceMembers.userId, userId), eq(schema.workspaceMembers.workspaceId, workspaceId)))
    .limit(1);
  return rows.length > 0;
}
