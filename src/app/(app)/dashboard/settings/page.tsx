import { requireWorkspaceContext } from "@/lib/auth/guard";
import { WorkspaceSettingsForm } from "@/components/dashboard/workspace-settings-form";
import { BillingCard } from "@/components/dashboard/billing-card";
import { CustomDomainForm } from "@/components/dashboard/custom-domain-form";
import { limitsFor } from "@/lib/plans";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ upgraded?: string }> }) {
  const { workspace } = await requireWorkspaceContext();
  const { upgraded } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-semibold tracking-tightest text-ink">Settings</h1>
      {upgraded && (
        <div className="mt-4 rounded-xl border border-spruce-100 bg-spruce-50 px-4 py-3 text-sm font-medium text-spruce-700">
          🎉 Welcome to Pro. Custom domains, branding removal and more are now unlocked.
        </div>
      )}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <WorkspaceSettingsForm workspaceId={workspace.id} name={workspace.name} accentColor={workspace.accentColor} />
        <BillingCard plan={workspace.plan} />
        <CustomDomainForm workspaceId={workspace.id} current={workspace.customDomain} isPro={limitsFor(workspace.plan).canCustomDomain} />
      </div>
    </div>
  );
}
