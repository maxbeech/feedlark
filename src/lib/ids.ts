import { customAlphabet } from "nanoid";

// URL-friendly, unambiguous id alphabet.
const nano = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 16);

export function newId(prefix: string): string {
  return `${prefix}_${nano()}`;
}

export function anonVoterId(): string {
  return `v_${nano()}`;
}
