import { requireWorkspaceContext } from "@/lib/auth/guard";
import { WorkspaceSettingsForm } from "@/components/dashboard/workspace-settings-form";
import { BillingCard } from "@/components/dashboard/billing-card";
import { CustomDomainForm } from "@/components/dashboard/custom-domain-form";
import { limitsFor } from "@/lib/plans";
import { reconcileCheckoutSuccess } from "@/lib/billing/reconcile";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string; session_id?: string }>;
}) {
  let { workspace } = await requireWorkspaceContext();
  const { upgraded, session_id: sessionId } = await searchParams;
  let reconciliationFailed = false;
  if (upgraded && sessionId) {
    try {
      await reconcileCheckoutSuccess(workspace, sessionId);
      ({ workspace } = await requireWorkspaceContext());
    } catch (error) {
      reconciliationFailed = true;
      console.error("[billing] Checkout return reconciliation failed", error);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-semibold tracking-tightest text-ink">Settings</h1>
      {upgraded && (
        <div className="mt-4 rounded-xl border border-spruce-100 bg-spruce-50 px-4 py-3 text-sm font-medium text-spruce-700">
          Welcome to Pro. Team seats, private boards, custom domains and more are now unlocked.
        </div>
      )}
      {reconciliationFailed && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Your payment is being confirmed. Your card was not charged again; refresh shortly or contact support with your Stripe receipt if Pro is still unavailable.
        </p>
      )}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <WorkspaceSettingsForm workspaceId={workspace.id} name={workspace.name} accentColor={workspace.accentColor} />
        <BillingCard plan={workspace.plan} />
        <CustomDomainForm workspaceId={workspace.id} current={workspace.customDomain} isPro={limitsFor(workspace.plan).canCustomDomain} />
      </div>
    </div>
  );
}
