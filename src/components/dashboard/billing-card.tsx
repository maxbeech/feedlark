import { Button, Card, Badge } from "@/components/ui";
import { ALWAYS_FREE, PRO_PRICE_MONTHLY, limitsFor } from "@/lib/plans";
import { stripeEnabled } from "@/lib/stripe";

export function BillingCard({ plan }: { plan: string }) {
  const isPro = plan === "pro";
  const limits = limitsFor(plan);
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-ink">Plan & billing</h2>
        <Badge className={isPro ? "bg-brand-100 text-brand-700" : "bg-cream text-ink-soft"}>{isPro ? "Pro" : "Free"}</Badge>
      </div>

      <ul className="mt-4 space-y-1.5 text-sm text-ink-soft">
        {ALWAYS_FREE.map((f) => (
          <li key={f}>✓ {f}</li>
        ))}
        <li className={limits.canRemoveBranding ? "text-ink" : "text-ink-muted"}>{limits.canRemoveBranding ? "✓" : "✕"} Remove Feedlark branding</li>
        <li className={limits.canCustomDomain ? "text-ink" : "text-ink-muted"}>{limits.canCustomDomain ? "✓" : "✕"} Custom domain</li>
        <li className={limits.canPrivateBoards ? "text-ink" : "text-ink-muted"}>{limits.canPrivateBoards ? "✓" : "✕"} Private boards</li>
        <li className={limits.canUseAI ? "text-ink" : "text-ink-muted"}>{limits.canUseAI ? "✓" : "✕"} Smart duplicate detection</li>
      </ul>

      <div className="mt-6">
        {!stripeEnabled ? (
          <p className="rounded-lg bg-cream px-3 py-2 text-sm text-ink-muted">
            Billing isn&apos;t configured on this deployment. The Free plan is fully functional.
          </p>
        ) : isPro ? (
          <form action="/api/stripe/portal" method="POST">
            <Button type="submit" variant="outline">Manage subscription</Button>
          </form>
        ) : (
          <form action="/api/stripe/checkout" method="POST">
            <Button type="submit">
              Upgrade to Pro, ${PRO_PRICE_MONTHLY}/seat/mo
            </Button>
            <p className="mt-2 text-xs text-ink-muted">Flat per admin seat. Never per voter.</p>
          </form>
        )}
      </div>
    </Card>
  );
}
