import "server-only";
import { getStripe } from "@/lib/stripe";

/**
 * Keep the Pro subscription's seat quantity in step with the real admin count,
 * so billing is honestly per-seat. Best-effort: no Stripe / no subscription is a
 * no-op (Free workspaces), and we only call Stripe when the quantity changes.
 */
export async function syncSeatQuantity(subscriptionId: string | null | undefined, seats: number): Promise<void> {
  const stripe = getStripe();
  if (!stripe || !subscriptionId || seats < 1) return;
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const item = sub.items.data[0];
  if (!item || item.quantity === seats) return;
  await stripe.subscriptions.update(subscriptionId, {
    items: [{ id: item.id, quantity: seats }],
    proration_behavior: "create_prorations",
  });
}
