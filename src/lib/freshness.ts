/** Deals added within this window get the "New" badge. */
export const NEW_WINDOW_HOURS = 48;

const HOUR_MS = 3_600_000;
const SITE_TZ_OFFSET = '+07:00';

interface Dated {
  end_date: string | null;
  added_at?: string | null;
}

/** Parse `added_at`; date-only values are midnight Asia/Saigon. */
export function parseAddedAt(addedAt: string | null | undefined): Date | null {
  if (!addedAt) return null;
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(addedAt)
    ? `${addedAt}T00:00:00${SITE_TZ_OFFSET}`
    : addedAt;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** ISO instant when the "New" badge should disappear, or null if no added_at. */
export function newUntil(
  addedAt: string | null | undefined,
  windowHours = NEW_WINDOW_HOURS
): string | null {
  const added = parseAddedAt(addedAt);
  if (!added) return null;
  return new Date(added.getTime() + windowHours * HOUR_MS).toISOString();
}

export function isNewDeal(
  addedAt: string | null | undefined,
  now = new Date(),
  windowHours = NEW_WINDOW_HOURS
): boolean {
  const added = parseAddedAt(addedAt);
  if (!added) return false;
  const age = now.getTime() - added.getTime();
  return age >= 0 && age <= windowHours * HOUR_MS;
}

/** Soonest end date first; unknown end dates last; stable otherwise. */
export function sortBySoonestEnd<T extends Dated>(list: readonly T[]): T[] {
  return [...list].sort((a, b) => {
    if (!a.end_date && !b.end_date) return 0;
    if (!a.end_date) return 1;
    if (!b.end_date) return -1;
    return a.end_date.localeCompare(b.end_date);
  });
}

/** Deals ending between today and `days` from today (inclusive), soonest first. */
export function endingWithin<T extends Dated>(
  list: readonly T[],
  days: number,
  today = new Date()
): T[] {
  const start = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return sortBySoonestEnd(
    list.filter((deal) => {
      if (!deal.end_date) return false;
      const [y, m, d] = deal.end_date.split('-').map(Number);
      if (!y || !m || !d) return false;
      const diff = Math.round((Date.UTC(y, m - 1, d) - start) / 86_400_000);
      return diff >= 0 && diff <= days;
    })
  );
}

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** ISO instant a deal starts: `start_date` at midnight Asia/Saigon. */
export function startsAt(startDate: string | null | undefined): string | null {
  if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return null;
  return new Date(`${startDate}T00:00:00${SITE_TZ_OFFSET}`).toISOString();
}

export function isUpcoming(startDate: string | null | undefined, now = new Date()): boolean {
  const start = startsAt(startDate);
  return start !== null && now.getTime() < Date.parse(start);
}

export function startLabel(startDate: string): { en: string; vi: string } {
  const [, m, d] = startDate.split('-').map(Number);
  return { en: `Starts ${d} ${MONTHS_EN[m - 1]}`, vi: `Bắt đầu ${d}/${m}` };
}
