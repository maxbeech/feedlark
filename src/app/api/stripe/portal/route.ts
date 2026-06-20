import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getActiveWorkspaceForUser } from "@/lib/data/team";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

export async function POST() {
  const stripe = getStripe();
  if (!stripeEnabled || !stripe) return NextResponse.json({ error: "billing_unconfigured" }, { status: 503 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(absoluteUrl("/login"), 303);
  const ws = await getActiveWorkspaceForUser(user.id);
  if (!ws?.stripeCustomerId) return NextResponse.redirect(absoluteUrl("/dashboard/settings"), 303);

  const session = await stripe.billingPortal.sessions.create({
    customer: ws.stripeCustomerId,
    return_url: absoluteUrl("/dashboard/settings"),
  });
  return NextResponse.redirect(session.url, 303);
}
