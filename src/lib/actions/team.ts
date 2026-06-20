"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { newId } from "@/lib/ids";
import { isValidEmail, absoluteUrl } from "@/lib/utils";
import { requireWorkspaceContext, assertOwner } from "@/lib/auth/guard";
import { getCurrentUser } from "@/lib/auth/session";
import { userIsMember } from "@/lib/data/workspace";
import { seatUsage, ACTIVE_WS_COOKIE } from "@/lib/data/team";
import { limitsFor } from "@/lib/plans";
import { sendEmail } from "@/lib/email";
import { syncSeatQuantity } from "@/lib/stripe-seats";

const INVITE_TTL = 60 * 60 * 24 * 7; // 7 days

export type TeamResult = { error?: string; ok?: boolean };

/** Invite a teammate by email (owner only, Pro, within the seat cap). */
export async function inviteMemberAction(_prev: TeamResult, formData: FormData): Promise<TeamResult> {
  const { workspace } = await requireWorkspaceContext();
  await assertOwner(workspace.id);
  const email = String(formData.get("email") || "").toLowerCase().trim();
  if (!isValidEmail(email)) return { error: "Enter a valid email address." };

  const limits = limitsFor(workspace.plan);
  const usage = await seatUsage(workspace.id);
  if (usage.used >= limits.seats) {
    return {
      error: workspace.plan === "pro"
        ? `All ${limits.seats} seats are in use. Remove a teammate to free one up.`
        : "Inviting teammates is a Pro feature. Upgrade to add your team.",
    };
  }

  // Already a member?
  const existing = await db
    .select({ id: schema.workspaceMembers.id })
    .from(schema.workspaceMembers)
    .innerJoin(schema.users, eq(schema.workspaceMembers.userId, schema.users.id))
    .where(and(eq(schema.workspaceMembers.workspaceId, workspace.id), eq(schema.users.email, email)))
    .limit(1);
  if (existing.length) return { error: "That person is already on your team." };

  const token = newId("itk") + newId("x").slice(2);
  try {
    await db.insert(schema.invitations).values({
      id: newId("inv"),
      workspaceId: workspace.id,
      email,
      role: "admin",
      token,
      invitedByUserId: (await getCurrentUser())!.id,
      expiresAt: Math.floor(Date.now() / 1000) + INVITE_TTL,
    });
  } catch {
    return { error: "There's already a pending invite for that email." };
  }

  await sendEmail({
    to: email,
    subject: `You're invited to ${workspace.name} on Feedlark`,
    text: `You've been invited to help manage ${workspace.name}'s feedback on Feedlark.\n\nAccept your invite:\n${absoluteUrl(`/invite/${token}`)}\n\nThis link is valid for 7 days.`,
  });
  revalidatePath("/dashboard/team");
  return { ok: true };
}

export async function revokeInviteAction(formData: FormData) {
  const { workspace } = await requireWorkspaceContext();
  await assertOwner(workspace.id);
  const id = String(formData.get("inviteId"));
  await db.delete(schema.invitations).where(and(eq(schema.invitations.id, id), eq(schema.invitations.workspaceId, workspace.id)));
  revalidatePath("/dashboard/team");
}

export async function removeMemberAction(formData: FormData) {
  const { workspace } = await requireWorkspaceContext();
  await assertOwner(workspace.id);
  const memberId = String(formData.get("memberId"));
  const member = (await db.select().from(schema.workspaceMembers).where(and(eq(schema.workspaceMembers.id, memberId), eq(schema.workspaceMembers.workspaceId, workspace.id))).limit(1))[0];
  if (!member || member.role === "owner") return; // never remove the owner
  await db.delete(schema.workspaceMembers).where(eq(schema.workspaceMembers.id, memberId));
  const used = (await seatUsage(workspace.id)).members;
  try { await syncSeatQuantity(workspace.stripeSubscriptionId, Math.max(1, used)); } catch { /* reconciles on next change */ }
  revalidatePath("/dashboard/team");
}

/** Accept a pending invite as the logged-in user (email must match). */
export async function acceptInviteAction(_prev: TeamResult, formData: FormData): Promise<TeamResult> {
  const token = String(formData.get("token") || "");
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in or sign up first." };
  const inv = (await db.select().from(schema.invitations).where(eq(schema.invitations.token, token)).limit(1))[0];
  if (!inv || inv.expiresAt < Math.floor(Date.now() / 1000)) return { error: "This invite is invalid or has expired." };
  if (user.email.toLowerCase() !== inv.email.toLowerCase()) return { error: `This invite is for ${inv.email}. Log in with that email to accept.` };

  const ws = (await db.select().from(schema.workspaces).where(eq(schema.workspaces.id, inv.workspaceId)).limit(1))[0];
  if (!ws) return { error: "That workspace no longer exists." };
  if (!(await userIsMember(user.id, ws.id))) {
    if ((await seatUsage(ws.id)).members >= limitsFor(ws.plan).seats) return { error: "That team is full." };
    await db.insert(schema.workspaceMembers).values({ id: newId("mem"), workspaceId: ws.id, userId: user.id, role: "admin" });
    try { await syncSeatQuantity(ws.stripeSubscriptionId, (await seatUsage(ws.id)).members); } catch { /* reconciles later */ }
  }
  await db.delete(schema.invitations).where(eq(schema.invitations.id, inv.id));
  (await cookies()).set(ACTIVE_WS_COOKIE, ws.id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  redirect("/dashboard");
}

/** Switch the active workspace (must be a member). */
export async function switchWorkspaceAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const wsId = String(formData.get("workspaceId"));
  if (await userIsMember(user.id, wsId)) {
    (await cookies()).set(ACTIVE_WS_COOKIE, wsId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  redirect("/dashboard");
}
