import "server-only";
import { cookies } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import type { Workspace } from "@/lib/db/schema";

export const ACTIVE_WS_COOKIE = "fl_ws";

export type Member = {
  id: string;
  userId: string;
  role: string;
  email: string;
  name: string;
  createdAt: number;
};

/** Admins of a workspace, with their user details, owner first. */
export async function listMembers(workspaceId: string): Promise<Member[]> {
  return db
    .select({
      id: schema.workspaceMembers.id,
      userId: schema.workspaceMembers.userId,
      role: schema.workspaceMembers.role,
      email: schema.users.email,
      name: schema.users.name,
      createdAt: schema.workspaceMembers.createdAt,
    })
    .from(schema.workspaceMembers)
    .innerJoin(schema.users, eq(schema.workspaceMembers.userId, schema.users.id))
    .where(eq(schema.workspaceMembers.workspaceId, workspaceId))
    .orderBy(schema.workspaceMembers.createdAt);
}

export async function listInvites(workspaceId: string) {
  return db
    .select()
    .from(schema.invitations)
    .where(eq(schema.invitations.workspaceId, workspaceId))
    .orderBy(schema.invitations.createdAt);
}

async function countRows(table: typeof schema.workspaceMembers | typeof schema.invitations, workspaceId: string) {
  const r = await db.select({ c: sql<number>`count(*)` }).from(table).where(eq(table.workspaceId, workspaceId));
  return Number(r[0]?.c ?? 0);
}

/** Seats in use = active members + pending invites (both reserve a seat). */
export async function seatUsage(workspaceId: string): Promise<{ members: number; invites: number; used: number }> {
  const [members, invites] = await Promise.all([
    countRows(schema.workspaceMembers, workspaceId),
    countRows(schema.invitations, workspaceId),
  ]);
  return { members, invites, used: members + invites };
}

/** Every workspace the user administers, with their role, oldest first. */
export async function getWorkspacesForUser(userId: string): Promise<{ ws: Workspace; role: string }[]> {
  return db
    .select({ ws: schema.workspaces, role: schema.workspaceMembers.role })
    .from(schema.workspaceMembers)
    .innerJoin(schema.workspaces, eq(schema.workspaceMembers.workspaceId, schema.workspaces.id))
    .where(eq(schema.workspaceMembers.userId, userId))
    .orderBy(schema.workspaces.createdAt);
}

/**
 * The user's active workspace: the one named by the `fl_ws` cookie if they're a
 * member of it, otherwise their first. Drives every dashboard query + billing.
 */
export async function getActiveWorkspaceForUser(userId: string): Promise<Workspace | null> {
  const memberships = await getWorkspacesForUser(userId);
  if (memberships.length === 0) return null;
  const wanted = (await cookies()).get(ACTIVE_WS_COOKIE)?.value;
  return memberships.find((m) => m.ws.id === wanted)?.ws ?? memberships[0].ws;
}
