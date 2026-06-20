import { Crown, Mail } from "lucide-react";
import { requireWorkspaceContext } from "@/lib/auth/guard";
import { listMembers, listInvites, seatUsage } from "@/lib/data/team";
import { limitsFor } from "@/lib/plans";
import { Card, Badge, LinkButton } from "@/components/ui";
import { InviteForm } from "@/components/dashboard/invite-form";
import { ConfirmSubmit } from "@/components/dashboard/confirm-submit";
import { removeMemberAction, revokeInviteAction } from "@/lib/actions/team";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const { workspace, role } = await requireWorkspaceContext();
  const limits = limitsFor(workspace.plan);
  const [members, invites, usage] = await Promise.all([
    listMembers(workspace.id),
    listInvites(workspace.id),
    seatUsage(workspace.id),
  ]);
  const isOwner = role === "owner";
  const isPro = workspace.plan === "pro";
  const full = usage.used >= limits.seats;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-semibold tracking-tightest text-ink">Team</h1>
      <p className="mt-1 text-sm text-ink-muted">Admins help triage feedback, reply and ship. Your customers who vote are always free.</p>

      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-ink">Seats</p>
            <p className="text-sm text-ink-muted">{usage.used} of {limits.seats} used{usage.invites ? ` (${usage.invites} pending)` : ""}</p>
          </div>
          <Badge className={isPro ? "bg-brand-100 text-brand-700" : "bg-cream text-ink-soft"}>{isPro ? "Pro" : "Free"}</Badge>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-cream">
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(100, (usage.used / limits.seats) * 100)}%` }} />
        </div>

        {!isPro ? (
          <div className="mt-5 rounded-xl border border-brand-200 bg-brand-50/60 p-4">
            <p className="text-sm font-medium text-ink">Add your team with Pro</p>
            <p className="mt-1 text-sm text-ink-soft">Invite up to 10 admins, billed per seat. Voters stay free, always.</p>
            <div className="mt-3"><LinkButton href="/dashboard/settings" size="sm">Upgrade to Pro</LinkButton></div>
          </div>
        ) : isOwner ? (
          <div className="mt-5">
            <InviteForm disabled={full} />
            {full && <p className="mt-2 text-xs text-ink-muted">All seats are in use. Remove a teammate to invite another.</p>}
          </div>
        ) : (
          <p className="mt-5 text-sm text-ink-muted">Only the workspace owner can invite or remove teammates.</p>
        )}
      </Card>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-ink-muted">Members</h2>
      <div className="mt-3 space-y-2">
        {members.map((m) => (
          <Card key={m.id} className="flex items-center justify-between p-4">
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-medium text-ink">
                {m.name || m.email.split("@")[0]}
                {m.role === "owner" && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800"><Crown className="h-3 w-3" /> Owner</span>}
              </p>
              <p className="truncate text-sm text-ink-muted">{m.email}</p>
            </div>
            {isOwner && m.role !== "owner" && (
              <ConfirmSubmit action={removeMemberAction} fields={{ memberId: m.id }} label="Remove" confirmMessage={`Remove ${m.email} from the team?`} variant="ghost" />
            )}
          </Card>
        ))}
      </div>

      {invites.length > 0 && (
        <>
          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-ink-muted">Pending invites</h2>
          <div className="mt-3 space-y-2">
            {invites.map((inv) => (
              <Card key={inv.id} className="flex items-center justify-between p-4">
                <p className="flex items-center gap-2 text-sm text-ink-soft"><Mail className="h-4 w-4 text-ink-muted" /> {inv.email}</p>
                {isOwner && (
                  <ConfirmSubmit action={revokeInviteAction} fields={{ inviteId: inv.id }} label="Revoke" confirmMessage={`Revoke the invite for ${inv.email}?`} variant="ghost" />
                )}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
