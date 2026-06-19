import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db, schema } from "@/lib/db";
import { getStripe, PRICE_PRO } from "@/lib/stripe";

/** True if a subscription actually carries our Pro price (not just any product). */
function hasProPrice(sub: Stripe.Subscription): boolean {
  if (!PRICE_PRO) return true; // no price configured ⇒ single-product mode
  return sub.items?.data?.some((it) => it.price?.id === PRICE_PRO) ?? false;
}

async function setPlan(opts: {
  customerId?: string | null;
  workspaceId?: string | null;
  subscriptionId?: string | null;
  plan: "free" | "pro";
}) {
  const set = {
    plan: opts.plan,
    brandingRemoved: opts.plan === "pro",
    aiEnabled: opts.plan === "pro",
    stripeSubscriptionId: opts.subscriptionId ?? null,
  };
  if (opts.workspaceId) {
    await db.update(schema.workspaces).set(set).where(eq(schema.workspaces.id, opts.workspaceId));
  } else if (opts.customerId) {
    await db.update(schema.workspaces).set(set).where(eq(schema.workspaces.stripeCustomerId, opts.customerId));
  }
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

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      // Only grant on a genuinely paid subscription checkout.
      const paid = s.payment_status === "paid" || s.payment_status === "no_payment_required";
      if (s.mode === "subscription" && paid) {
        await setPlan({
          workspaceId: s.client_reference_id,
          customerId: typeof s.customer === "string" ? s.customer : s.customer?.id,
          subscriptionId: typeof s.subscription === "string" ? s.subscription : s.subscription?.id,
          plan: "pro",
        });
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      // Pro only when the subscription is live AND carries our Pro price.
      const active = (sub.status === "active" || sub.status === "trialing") && hasProPrice(sub);
      await setPlan({ customerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id, subscriptionId: sub.id, plan: active ? "pro" : "free" });
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await setPlan({ customerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id, subscriptionId: null, plan: "free" });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
