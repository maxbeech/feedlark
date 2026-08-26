import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import type { Workspace } from "@/lib/db/schema";
import { db, schema } from "@/lib/db";
import { getStripe, PRICE_PRO } from "@/lib/stripe";
import { revalidatePublicWorkspace } from "@/lib/revalidate";

function hasProPrice(subscription: Stripe.Subscription): boolean {
  // A deliberately unconfigured local/test environment has no product price to
  // compare; production always has PRICE_PRO and must match it exactly.
  if (!PRICE_PRO) return true;
  return subscription.items.data.some((item) => item.price.id === PRICE_PRO);
}

/**
 * Independently verifies a buyer's return from Checkout.
 *
 * Stripe webhooks remain the lifecycle source of truth. This narrowly scoped
 * recovery is only an upgrade, only after a paid session, and only when both
 * its workspace reference and Stripe customer match the signed-in workspace.
 */
export async function reconcileCheckoutSuccess(
  workspace: Workspace,
  sessionId: string,
): Promise<"reconciled" | "not_paid" | "not_owned" | "not_entitled"> {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe is not configured");

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null;
  if (
    session.mode !== "subscription" ||
    !subscriptionId ||
    !["paid", "no_payment_required"].includes(session.payment_status)
  ) return "not_paid";
  if (session.client_reference_id !== workspace.id || !customerId || customerId !== workspace.stripeCustomerId) {
    return "not_owned";
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  if (!(["active", "trialing"].includes(subscription.status) && hasProPrice(subscription))) {
    return "not_entitled";
  }

  await db.update(schema.workspaces)
    .set({ plan: "pro", brandingRemoved: true, aiEnabled: true, stripeSubscriptionId: subscription.id })
    .where(eq(schema.workspaces.id, workspace.id));
  revalidatePublicWorkspace(workspace.slug);
  return "reconciled";
}
