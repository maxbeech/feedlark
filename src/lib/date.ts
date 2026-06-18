const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Format a unix-seconds timestamp as e.g. "Jun 18, 2026" (UTC, stable). */
export function formatDate(epochSeconds: number): string {
  const d = new Date(epochSeconds * 1000);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}
