import bcrypt from "bcryptjs";

const COST = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

/**
 * A real bcrypt hash to compare against when an account doesn't exist, so login
 * spends the same time whether or not the email is registered (no enumeration
 * via timing). The plaintext is irrelevant — it never matches a user password.
 */
export const DUMMY_HASH = "$2a$12$AAk33VFtLiqUXD6d5DjtTeMu0s2GRG.SvEFUkZOPl.wcOsJ1UsXBy";

/** Constant-work password check that never short-circuits on a missing user. */
export async function verifyAgainst(plain: string, hash: string | null | undefined): Promise<boolean> {
  const ok = await verifyPassword(plain, hash || DUMMY_HASH);
  return ok && Boolean(hash);
}
