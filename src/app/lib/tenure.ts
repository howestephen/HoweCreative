/** Career dates live here so no figure on the site has to be hand-updated. */
export const CAREER_START = new Date(2005, 4, 1); // May 2005, Good Salon Guide
export const UNCX_START = new Date(2021, 11, 1); // 1 December 2021, UNCX Network

/** Whole months elapsed between two dates, not counting a partial final month. */
export function monthsBetween(start: Date, end: Date): number {
  let months =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) months -= 1;
  return Math.max(0, months);
}

const plural = (value: number, unit: string) => `${value} ${unit}${value === 1 ? "" : "s"}`;

/** "4 yrs 7 mos" - years and months, never days. */
export function tenureSince(start: Date, now: Date = new Date()): string {
  const months = monthsBetween(start, now);
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) return plural(remainingMonths, "mo");
  if (remainingMonths === 0) return plural(years, "yr");
  return `${plural(years, "yr")} ${plural(remainingMonths, "mo")}`;
}

/** Whole years elapsed, for coarser copy like "21 years". */
export function yearsSince(start: Date, now: Date = new Date()): number {
  return Math.floor(monthsBetween(start, now) / 12);
}
