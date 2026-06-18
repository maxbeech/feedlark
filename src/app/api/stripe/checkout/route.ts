import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { getWorkspaceForUser } from "@/lib/data/workspace";
import { getStripe, stripeEnabled, PRICE_PRO } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

export async function POST() {
  const stripe = getStripe();
  if (!stripeEnabled || !stripe) {
    return NextResponse.json({ error: "billing_unconfigured" }, { status: 503 });
  }
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(absoluteUrl("/login"), 303);
  const ws = await getWorkspaceForUser(user.id);
  if (!ws) return NextResponse.redirect(absoluteUrl("/login"), 303);

  let customerId = ws.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, metadata: { workspaceId: ws.id } });
    customerId = customer.id;
    await db.update(schema.workspaces).set({ stripeCustomerId: customerId }).where(eq(schema.workspaces.id, ws.id));
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: PRICE_PRO, quantity: 1 }],
    client_reference_id: ws.id,
    allow_promotion_codes: true,
    success_url: absoluteUrl("/dashboard/settings?upgraded=1"),
    cancel_url: absoluteUrl("/dashboard/settings"),
  });
  return NextResponse.redirect(session.url ?? absoluteUrl("/dashboard/settings"), 303);
}
