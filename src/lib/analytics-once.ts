/**
 * True the first time a key is seen in this browser (or tab, for "session"), so
 * a reload of a URL that carries a one-off marker does not report the same
 * event twice. If storage is blocked there is nothing to remember it with, so
 * the event is allowed through once per mount rather than never.
 */
export function firstTime(scope: "local" | "session", key: string): boolean {
  try {
    const store = scope === "local" ? localStorage : sessionStorage;
    if (store.getItem(key)) return false;
    store.setItem(key, "1");
  } catch {
    /* storage unavailable (private mode) */
  }
  return true;
}
