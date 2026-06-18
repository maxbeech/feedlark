import { requireWorkspaceContext } from "@/lib/auth/guard";
import { WorkspaceSettingsForm } from "@/components/dashboard/workspace-settings-form";
import { BillingCard } from "@/components/dashboard/billing-card";

export default async function SettingsPage() {
  const { workspace } = await requireWorkspaceContext();
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-ink">Settings</h1>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <WorkspaceSettingsForm workspaceId={workspace.id} name={workspace.name} accentColor={workspace.accentColor} />
        <BillingCard plan={workspace.plan} />
      </div>
    </div>
  );
}
