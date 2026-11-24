export interface VnScheduleEntry {
  deal_id: string;
  from: string;
  to: string;
  slots: string | null;
  what: string;
}

export interface VnScheduleItem extends VnScheduleEntry {
  merchant: string;
  starts: boolean;
  lastDay: boolean;
}

export interface VnScheduleDay {
  date: string;
  label: string;
  items: VnScheduleItem[];
}

const WEEKDAYS_VI = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

function parseDay(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Inclusive list of YYYY-MM-DD days between two dates. */
export function scheduleDays(from: string, to: string): string[] {
  const days: string[] = [];
  const end = parseDay(to).getTime();
  for (let t = parseDay(from).getTime(); t <= end; t += 86_400_000) {
    days.push(new Date(t).toISOString().slice(0, 10));
  }
  return days;
}

function dayLabel(iso: string): string {
  const date = parseDay(iso);
  return `${WEEKDAYS_VI[date.getUTCDay()]} ${date.getUTCDate()}/${date.getUTCMonth() + 1}`;
}

/** Day-by-day plan; entries whose deal is not in `merchants` (expired or removed) are dropped. */
export function buildVnSchedule(
  entries: readonly VnScheduleEntry[],
  merchants: Readonly<Record<string, string>>,
  from: string,
  to: string
): VnScheduleDay[] {
  const live = entries.filter((e) => e.deal_id in merchants);
  return scheduleDays(from, to).map((date) => ({
    date,
    label: dayLabel(date),
    items: live
      .filter((e) => e.from <= date && date <= e.to)
      .map((e) => ({ ...e, merchant: merchants[e.deal_id], starts: e.from === date, lastDay: e.to === date })),
  }));
}
