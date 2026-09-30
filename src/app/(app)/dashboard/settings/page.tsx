import { requireWorkspaceContext } from "@/lib/auth/guard";
import { WorkspaceSettingsForm } from "@/components/dashboard/workspace-settings-form";
import { BillingCard } from "@/components/dashboard/billing-card";
import { CustomDomainForm } from "@/components/dashboard/custom-domain-form";
import { PurchaseTracker } from "@/components/dashboard/purchase-tracker";
import { limitsFor, PRO_PRICE_MONTHLY } from "@/lib/plans";
import { reconcileCheckoutSuccess } from "@/lib/billing/reconcile";
import { seatUsage } from "@/lib/data/team";
import { customDomainState } from "@/lib/custom-domains";
import { analyticsUserRef } from "@/lib/analytics-identity";
import { checkoutReturnEvent, type CheckoutReconcile } from "@/lib/analytics-events";
import { TrackOnMount } from "@/components/analytics/track-on-mount";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string; session_id?: string; checkout?: string; reason?: string }>;
}) {
  let { user, workspace } = await requireWorkspaceContext();
  const { upgraded, session_id: sessionId, checkout, reason } = await searchParams;
  let reconcile: CheckoutReconcile | undefined;
  if (upgraded && sessionId) {
    try {
      reconcile = await reconcileCheckoutSuccess(workspace, sessionId);
      ({ user, workspace } = await requireWorkspaceContext());
    } catch (error) {
      reconcile = "error";
      console.error("[billing] Checkout return reconciliation failed", error);
    }
  }
  const reconciliationFailed = reconcile === "error";
  // A cancel, a failed start or an unconfirmed return each send one event.
  const returned = checkoutReturnEvent({ checkout, reason, upgraded, sessionId, reconcile });
  const seats = (await seatUsage(workspace.id)).members;
  const domain = workspace.customDomain ? await customDomainState(workspace.customDomain) : null;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Only fires once reconcileCheckoutSuccess() has actually verified the
          Checkout Session against Stripe above — never on the bare query
          param, which a user could type into the URL bar themselves. */}
      <PurchaseTracker
        fire={reconcile === "reconciled"}
        identity={{ userRef: analyticsUserRef(user.id), plan: "paid" }}
        sessionId={sessionId ?? ""}
        priceMonthly={PRO_PRICE_MONTHLY}
        seats={seats}
      />
      {returned && <TrackOnMount name={returned.name} params={returned.params} />}
      <h1 className="font-display text-2xl font-semibold tracking-tightest text-ink">Settings</h1>
      {checkout === "failed" && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          We couldn&apos;t start checkout. Nothing was charged. Please try again in a moment.
        </p>
      )}
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
        <BillingCard plan={workspace.plan} seats={seats} />
        <CustomDomainForm
          workspaceId={workspace.id}
          current={workspace.customDomain}
          isPro={limitsFor(workspace.plan).canCustomDomain}
          record={domain?.record ?? null}
          certificate={domain?.certificate ?? null}
        />
      </div>
    </div>
  );
}
