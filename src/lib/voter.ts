import "server-only";
import { cookies } from "next/headers";
import { anonVoterId } from "@/lib/ids";

const VOTER_COOKIE = "fl_voter";

/** Read the anonymous voter id from the cookie (no login needed to vote). */
export async function getVoterKey(): Promise<string> {
  return (await cookies()).get(VOTER_COOKIE)?.value ?? "";
}

/** Read or create-and-set the voter id. Used inside mutations. */
export async function ensureVoterKey(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(VOTER_COOKIE)?.value;
  if (existing) return existing;
  const id = anonVoterId();
  jar.set(VOTER_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 2,
  });
  return id;
}
