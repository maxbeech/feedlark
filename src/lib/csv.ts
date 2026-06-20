/** Pure CSV helpers (no IO) so export formatting is unit-testable. */

/** Quote a cell only when needed, doubling embedded quotes (RFC 4180). */
export function csvCell(value: string | number | null | undefined): string {
  const s = String(value ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Join a grid of rows into a CSV string. */
export function toCsv(rows: (string | number | null | undefined)[][]): string {
  return rows.map((r) => r.map(csvCell).join(",")).join("\n");
}
