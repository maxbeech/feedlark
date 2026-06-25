import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import type Stripe from "stripe";
import { db, schema } from "@/lib/db";
import { getStripe, PRICE_PRO } from "@/lib/stripe";
import { revalidatePublicWorkspace } from "@/lib/revalidate";

/** True if a subscription actually carries our Pro price (not just any product). */
function hasProPrice(sub: Stripe.Subscription): boolean {
  if (!PRICE_PRO) return true; // no price configured ⇒ single-product mode
  return sub.items?.data?.some((it) => it.price?.id === PRICE_PRO) ?? false;
}

type Target = { customerId?: string | null; workspaceId?: string | null };

async function resolveWorkspace(t: Target) {
  if (t.workspaceId) {
    return (await db.select().from(schema.workspaces).where(eq(schema.workspaces.id, t.workspaceId)).limit(1))[0] ?? null;
  }
  if (t.customerId) {
    return (await db.select().from(schema.workspaces).where(eq(schema.workspaces.stripeCustomerId, t.customerId)).limit(1))[0] ?? null;
  }
  return null;
}

/** Grant Pro: unlock features and record the active subscription. */
async function upgradeToPro(t: Target, subscriptionId: string | null) {
  const ws = await resolveWorkspace(t);
  if (!ws) return;
  await db.update(schema.workspaces)
    .set({ plan: "pro", brandingRemoved: true, aiEnabled: true, stripeSubscriptionId: subscriptionId })
    .where(eq(schema.workspaces.id, ws.id));
  revalidatePublicWorkspace(ws.slug);
}

/**
 * Revoke Pro AND clean up paid resources so nothing is given away for free:
 * lock branding/AI, drop the custom domain, and prune extra admin seats +
 * pending invites back to the single free seat (owner only).
 */
async function downgradeToFree(t: Target) {
  const ws = await resolveWorkspace(t);
  if (!ws) return;
  await db.update(schema.workspaces)
    .set({ plan: "free", brandingRemoved: false, aiEnabled: false, customDomain: null, stripeSubscriptionId: null })
    .where(eq(schema.workspaces.id, ws.id));
  // Free is single-seat: remove every non-owner member and all pending invites.
  await db.delete(schema.workspaceMembers)
    .where(and(eq(schema.workspaceMembers.workspaceId, ws.id), ne(schema.workspaceMembers.role, "owner")));
  await db.delete(schema.invitations).where(eq(schema.invitations.workspaceId, ws.id));
  revalidatePublicWorkspace(ws.slug);
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ error: "unconfigured" }, { status: 503 });

  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig ?? "", secret);
  } catch (e) {
    return NextResponse.json({ error: `invalid_signature: ${String(e)}` }, { status: 400 });
  }

  // Idempotency: Stripe delivers at least once. Record the event id first; if we
  // already processed it, acknowledge without re-running side-effects.
  try {
    const ins = await db.insert(schema.stripeEvents).values({ id: event.id, type: event.type }).onConflictDoNothing().returning({ id: schema.stripeEvents.id });
    if (ins.length === 0) return NextResponse.json({ received: true, duplicate: true });
  } catch {
    // Ledger insert failed (e.g. race) — treat as duplicate to stay safe.
    return NextResponse.json({ received: true, duplicate: true });
  }

  const customerOf = (sub: Stripe.Subscription) => (typeof sub.customer === "string" ? sub.customer : sub.customer.id);

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      const paid = s.payment_status === "paid" || s.payment_status === "no_payment_required";
      if (s.mode === "subscription" && paid) {
        await upgradeToPro(
          { workspaceId: s.client_reference_id, customerId: typeof s.customer === "string" ? s.customer : s.customer?.id },
          typeof s.subscription === "string" ? s.subscription : s.subscription?.id ?? null,
        );
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const target = { customerId: customerOf(sub) };
      if ((sub.status === "active" || sub.status === "trialing") && hasProPrice(sub)) {
        await upgradeToPro(target, sub.id);
      } else if (sub.status === "past_due" || sub.status === "unpaid" || sub.status === "incomplete") {
        // Grace period: a failed/pending renewal does NOT immediately downgrade.
        // Stripe Smart Retries will recover most; final failure arrives as
        // `subscription.deleted`, which downgrades. Keep Pro for now.
      } else {
        // canceled / incomplete_expired / paused → revoke + clean up.
        await downgradeToFree(target);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await downgradeToFree({ customerId: customerOf(sub) });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
