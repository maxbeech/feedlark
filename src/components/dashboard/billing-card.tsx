import { Check, Lock } from "lucide-react";
import { Card, Badge } from "@/components/ui";
import { ALWAYS_FREE, PRO_FEATURES, PRO_PRICE_MONTHLY } from "@/lib/plans";
import { stripeEnabled } from "@/lib/stripe";
import { UpgradeForm, ManageSubscriptionForm } from "@/components/dashboard/billing-actions";

export function BillingCard({ plan, seats = 1 }: { plan: string; seats?: number }) {
  const isPro = plan === "pro";
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-ink">Plan &amp; billing</h2>
        <Badge className={isPro ? "bg-brand-100 text-brand-700" : "bg-cream text-ink-soft"}>{isPro ? "Pro" : "Free"}</Badge>
      </div>

      <ul className="mt-4 space-y-1.5 text-sm">
        {ALWAYS_FREE.map((f) => (
          <li key={f} className="flex items-start gap-2 text-ink-soft"><Check className="mt-0.5 h-4 w-4 shrink-0 text-spruce-600" /> {f}</li>
        ))}
        {PRO_FEATURES.map((f) => (
          <li key={f} className={`flex items-start gap-2 ${isPro ? "text-ink-soft" : "text-ink-muted"}`}>
            {isPro ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> : <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-muted" />} {f}
          </li>
        ))}
      </ul>

      <div className="mt-6">
        {!stripeEnabled ? (
          <p className="rounded-lg bg-cream px-3 py-2 text-sm text-ink-muted">
            Billing isn&apos;t configured on this deployment. The Free plan is fully functional.
          </p>
        ) : isPro ? (
          <ManageSubscriptionForm />
        ) : (
          <UpgradeForm priceMonthly={PRO_PRICE_MONTHLY} seats={seats} />
        )}
      </div>
    </Card>
  );
}
