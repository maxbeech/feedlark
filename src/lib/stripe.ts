import Stripe from "stripe";

/** Billing is fully optional: unset env => Free plan only, no 500s. */
export const stripeEnabled = Boolean(
  process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_PRO_MONTHLY,
);

let cached: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  // Pin the API version so a future SDK bump can't silently change webhook
  // payload shapes underneath us.
  if (!cached) cached = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" });
  return cached;
}

export const PRICE_PRO = process.env.STRIPE_PRICE_PRO_MONTHLY ?? "";
