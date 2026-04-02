/**
 * Parse `dateApplied` as a calendar date in the user's local timezone.
 * `new Date("YYYY-MM-DD")` is UTC midnight and shifts the day in many locales.
 */
export function parseApplicationDateLocal(dateApplied: string): Date | null {
  const s = dateApplied.trim();
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (ymd) {
    const y = Number(ymd[1]);
    const m = Number(ymd[2]) - 1;
    const d = Number(ymd[3]);
    const dt = new Date(y, m, d);
    if (dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d) {
      return dt;
    }
    return null;
  }
  const dt = new Date(s);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export function formatLocalYmd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatMonthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
