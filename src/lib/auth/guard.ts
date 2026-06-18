import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getWorkspaceForUser, userIsMember } from "@/lib/data/workspace";
import type { User, Workspace } from "@/lib/db/schema";

/** Require a logged-in user with a workspace, else redirect to login. */
export async function requireWorkspaceContext(): Promise<{ user: User; workspace: Workspace }> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const workspace = await getWorkspaceForUser(user.id);
  if (!workspace) redirect("/login");
  return { user, workspace };
}

/** Throw unless the current user administers the given workspace. */
export async function assertMembership(workspaceId: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthorized");
  if (!(await userIsMember(user.id, workspaceId))) throw new Error("forbidden");
  return user;
}
