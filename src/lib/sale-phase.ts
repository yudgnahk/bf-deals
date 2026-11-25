export type SalePhaseKey = 'pre-bf' | 'bf-live' | 'cm-live' | 'over';

export interface SalePhase {
  key: SalePhaseKey;
  /** Epoch ms the clock counts down to; null once the sale week is over. */
  target: number | null;
  label: { en: string; vi: string };
  sub: { en: string; vi: string };
}

// Midnight Asia/Saigon boundaries of the sale week.
const BF_START = Date.parse('2026-11-27T00:00:00+07:00');
const CM_START = Date.parse('2026-11-30T00:00:00+07:00');
const CM_END = Date.parse('2026-12-01T00:00:00+07:00');

export function salePhase(now: number): SalePhase {
  if (now < BF_START) {
    return {
      key: 'pre-bf',
      target: BF_START,
      label: { en: 'Black Friday starts', vi: 'Black Friday bắt đầu sau' },
      sub: { en: 'Fri 27 Nov, midnight Asia/Saigon · Cyber Monday Mon 30 Nov', vi: 'Thứ Sáu 27/11, 0h giờ VN · Cyber Monday thứ Hai 30/11' },
    };
  }
  if (now < CM_START) {
    return {
      key: 'bf-live',
      target: CM_START,
      label: { en: 'Black Friday is live · Cyber Monday in', vi: 'Black Friday đang diễn ra · Cyber Monday sau' },
      sub: { en: 'Many deals run through Cyber Monday — check each end date', vi: 'Nhiều deal kéo dài tới Cyber Monday — xem hạn từng deal' },
    };
  }
  if (now < CM_END) {
    return {
      key: 'cm-live',
      target: CM_END,
      label: { en: 'Cyber Monday ends in', vi: 'Cyber Monday kết thúc sau' },
      sub: { en: 'Mon 30 Nov, until midnight Asia/Saigon', vi: 'Thứ Hai 30/11, đến 0h giờ VN' },
    };
  }
  return {
    key: 'over',
    target: null,
    label: { en: 'Sale week is over', vi: 'Tuần sale đã kết thúc' },
    sub: { en: 'Some deals run into December — sort by Ending soon', vi: 'Một số deal kéo dài sang tháng 12 — sắp theo Sắp hết' },
  };
}

export function splitDuration(ms: number): { d: number; h: number; m: number; s: number } {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}
