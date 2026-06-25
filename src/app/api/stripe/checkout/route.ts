import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { getActiveWorkspaceForUser, seatUsage } from "@/lib/data/team";
import { getStripe, stripeEnabled, PRICE_PRO } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

export async function POST() {
  const stripe = getStripe();
  if (!stripeEnabled || !stripe) {
    return NextResponse.json({ error: "billing_unconfigured" }, { status: 503 });
  }
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(absoluteUrl("/login"), 303);
  const ws = await getActiveWorkspaceForUser(user.id);
  if (!ws) return NextResponse.redirect(absoluteUrl("/login"), 303);

  let customerId = ws.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, metadata: { workspaceId: ws.id } });
    customerId = customer.id;
    await db.update(schema.workspaces).set({ stripeCustomerId: customerId }).where(eq(schema.workspaces.id, ws.id));
  }

  // Never create a second subscription. If the customer already has a live
  // (active/trialing/past_due) subscription, send them to manage it instead of
  // checking out again — prevents accidental double billing during webhook lag.
  const existing = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 10 });
  const live = existing.data.find((s) => ["active", "trialing", "past_due", "unpaid"].includes(s.status));
  if (live) {
    try {
      const portal = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: absoluteUrl("/dashboard/settings") });
      return NextResponse.redirect(portal.url, 303);
    } catch {
      return NextResponse.redirect(absoluteUrl("/dashboard/settings?already=1"), 303);
    }
  }

  // Bill per seat: start at the current admin count (at least one).
  const seats = Math.max(1, (await seatUsage(ws.id)).members);

  // Stripe Tax must be activated in the dashboard before automatic_tax works,
  // otherwise session creation throws. Gate it behind a flag flipped post-setup.
  const taxEnabled = process.env.STRIPE_TAX_ENABLED === "true";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: PRICE_PRO, quantity: seats }],
    client_reference_id: ws.id,
    allow_promotion_codes: true,
    billing_address_collection: "required",
    ...(taxEnabled
      ? {
          automatic_tax: { enabled: true },
          tax_id_collection: { enabled: true },
          customer_update: { address: "auto", name: "auto" },
        }
      : {}),
    success_url: absoluteUrl("/dashboard/settings?upgraded=1"),
    cancel_url: absoluteUrl("/dashboard/settings"),
  });
  return NextResponse.redirect(session.url ?? absoluteUrl("/dashboard/settings"), 303);
}
