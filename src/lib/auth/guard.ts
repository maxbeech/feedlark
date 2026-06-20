import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getWorkspacesForUser, getActiveWorkspaceForUser } from "@/lib/data/team";
import { userIsMember } from "@/lib/data/workspace";
import type { User, Workspace } from "@/lib/db/schema";

export type WorkspaceContext = {
  user: User;
  workspace: Workspace;
  role: string;
  workspaces: { ws: Workspace; role: string }[];
};

/** Require a logged-in user with a workspace, else redirect to login. */
export async function requireWorkspaceContext(): Promise<WorkspaceContext> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const workspaces = await getWorkspacesForUser(user.id);
  if (workspaces.length === 0) redirect("/login");
  const workspace = (await getActiveWorkspaceForUser(user.id))!;
  const role = workspaces.find((m) => m.ws.id === workspace.id)?.role ?? "admin";
  return { user, workspace, role, workspaces };
}

/** Throw unless the current user administers the given workspace. */
export async function assertMembership(workspaceId: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthorized");
  if (!(await userIsMember(user.id, workspaceId))) throw new Error("forbidden");
  return user;
}

/** Throw unless the current user is the OWNER of the given workspace. */
export async function assertOwner(workspaceId: string): Promise<User> {
  const user = await assertMembership(workspaceId);
  const rows = await getWorkspacesForUser(user.id);
  const role = rows.find((m) => m.ws.id === workspaceId)?.role;
  if (role !== "owner") throw new Error("forbidden");
  return user;
}
