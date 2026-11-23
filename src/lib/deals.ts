import dealsData from '../data/deals.json';
import affiliatesConfig from '../config/affiliates.json';
import { DEFAULT_REGION_FILTER } from './constants';

export { DEFAULT_REGION_FILTER };

export type DealRegion = 'vn' | 'intl' | 'both';
export type AffStatus = 'aff-possible' | 'hook';

export interface Deal {
  id: string;
  title: string;
  merchant: string;
  region: DealRegion;
  category: string;
  discount_text: string | null;
  price: string | null;
  end_date: string | null;
  source_url: string;
  aff_program: string | null;
  aff_status: AffStatus;
  verified_at: string;
  notes?: string;
  /** When true, deal is omitted from the site (kept in data for later). */
  hidden?: boolean;
}

export interface AffiliateProgramConfig {
  id_or_tag: string;
  link_template: string;
  notes?: string;
}

export interface ResolvedLink {
  href: string;
  isAffiliate: boolean;
  todoAff: boolean;
  rel: string;
}

const deals = dealsData as Deal[];
const programs = affiliatesConfig.programs as Record<string, AffiliateProgramConfig>;

/** Compare YYYY-MM-DD end dates as calendar dates (local). */
export function isDealExpired(deal: Deal, today = new Date()): boolean {
  if (!deal.end_date) return false;
  const [y, m, d] = deal.end_date.split('-').map(Number);
  if (!y || !m || !d) return false;
  const end = new Date(y, m - 1, d, 23, 59, 59, 999);
  return today > end;
}

/** Deals that can appear on the site (not manually hidden). */
export function getVisibleDeals(): Deal[] {
  return deals.filter((deal) => !deal.hidden);
}

export function getActiveDeals(today = new Date()): Deal[] {
  return getVisibleDeals().filter((deal) => !isDealExpired(deal, today));
}

export function getAllDeals(): Deal[] {
  return deals;
}

/** Preferred filter order: AI / dev / SaaS first, then the rest A–Z. */
export const CATEGORY_PRIORITY = [
  'ai',
  'dev-tools',
  'saas',
  'productivity',
  'design',
  'marketing',
] as const;

/** Categories derived from currently visible (non-hidden) deals. */
export function getCategories(list: Deal[] = getVisibleDeals()): string[] {
  const cats = [...new Set(list.map((d) => d.category))];
  return cats.sort((a, b) => {
    const ai = CATEGORY_PRIORITY.indexOf(a as (typeof CATEGORY_PRIORITY)[number]);
    const bi = CATEGORY_PRIORITY.indexOf(b as (typeof CATEGORY_PRIORITY)[number]);
    const ap = ai === -1 ? 1000 : ai;
    const bp = bi === -1 ? 1000 : bi;
    if (ap !== bp) return ap - bp;
    return a.localeCompare(b);
  });
}

/** Sort active deals by soonest end_date; unknown end dates last. */
export function sortEndingSoon(list: Deal[]): Deal[] {
  return [...list].sort((a, b) => {
    const ae = a.end_date || '';
    const be = b.end_date || '';
    if (!ae && !be) return 0;
    if (!ae) return 1;
    if (!be) return -1;
    return ae.localeCompare(be);
  });
}

/**
 * Pull clearly labeled promo/coupon codes from discount_text + notes.
 * Conservative: only when the text uses "code …" phrasing; skips "no promo code".
 */
export function extractPromoCodes(deal: Deal): string[] {
  const text = [deal.discount_text, deal.notes].filter(Boolean).join('\n');
  if (!text) return [];

  const codes: string[] = [];
  const seen = new Set<string>();
  const patterns = [
    /\b(?:(?:use|enter|apply)\s+(?:the\s+)?(?:promo\s+)?code|promo\s+code|with\s+code|uses\s+code)\s*[:=]?\s*([A-Za-z0-9][A-Za-z0-9_-]{2,})\b/g,
    /\bCodes?:\s*([A-Za-z0-9][A-Za-z0-9_-]{2,})\s*=/g,
    /\b[Cc]ode\s+([A-Za-z0-9][A-Za-z0-9_-]{2,})\b/g,
  ];
  const ban = new Set([
    'OFF',
    'THE',
    'AND',
    'FOR',
    'WITH',
    'FROM',
    'NEW',
    'OLD',
    'USD',
    'VND',
    'NEEDED',
    'OFFICIAL',
    'HERE',
    'BELOW',
    'MUST',
    'ONLY',
    'APPLIED',
    'ENTERED',
  ]);

  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      const start = Math.max(0, m.index - 24);
      const before = text.slice(start, m.index).toLowerCase();
      if (/\bno\s+$/.test(before) || /without\s+(a\s+)?$/.test(before) || /invent\s+$/.test(before)) {
        continue;
      }
      const after = text.slice(m.index + m[0].length, m.index + m[0].length + 12).toLowerCase();
      if (/^\s*needed\b/.test(after)) continue;

      const raw = m[1];
      const key = raw.toUpperCase();
      if (ban.has(key) || seen.has(key)) continue;
      seen.add(key);
      codes.push(raw);
    }
  }

  return codes;
}

export function getLastVerifiedDate(list: Deal[] = getVisibleDeals()): string {
  const dates = list.map((d) => d.verified_at).filter(Boolean).sort();
  return dates[dates.length - 1] ?? '';
}

/**
 * Region matching. `both` shows in VN and International filters.
 * VN filter UI is retained for a later re-enable; v1 defaults to intl.
 */
export function matchesRegion(deal: Deal, regionFilter: string): boolean {
  if (regionFilter === 'all') return true;
  if (deal.region === 'both') return true;
  return deal.region === regionFilter;
}

export function buildDealLink(deal: Deal): ResolvedLink {
  const fallback: ResolvedLink = {
    href: deal.source_url,
    isAffiliate: false,
    todoAff: deal.aff_status === 'aff-possible',
    rel: 'noopener noreferrer',
  };

  if (deal.aff_status !== 'aff-possible' || !deal.aff_program) {
    return {
      ...fallback,
      todoAff: false,
    };
  }

  const cfg = programs[deal.aff_program];
  if (!cfg) {
    return fallback;
  }

  const id = (cfg.id_or_tag || '').trim();
  const template = (cfg.link_template || '').trim();

  if (!id && !template) {
    return fallback;
  }

  let href = deal.source_url;
  if (template) {
    href = template
      .replaceAll('{url}', encodeURIComponent(deal.source_url))
      .replaceAll('{id}', encodeURIComponent(id));
  } else if (id) {
    try {
      const u = new URL(deal.source_url);
      u.searchParams.set('ref', id);
      href = u.toString();
    } catch {
      href = deal.source_url;
    }
  }

  return {
    href,
    isAffiliate: true,
    todoAff: false,
    rel: 'sponsored nofollow noopener',
  };
}

/** Nice labels for known categories; unknown keys fall back to the raw slug. */
export const CATEGORY_LABELS: Record<string, { en: string; vi: string }> = {
  ai: { en: 'AI tools', vi: 'Công cụ AI' },
  'dev-tools': { en: 'Developer tools', vi: 'Công cụ lập trình' },
  saas: { en: 'SaaS', vi: 'SaaS' },
  productivity: { en: 'Productivity', vi: 'Năng suất' },
  design: { en: 'Design', vi: 'Thiết kế' },
  marketing: { en: 'Marketing', vi: 'Marketing' },
  hosting: { en: 'Hosting', vi: 'Hosting' },
  vpn: { en: 'VPN', vi: 'VPN' },
  courses: { en: 'Courses', vi: 'Khóa học' },
  electronics: { en: 'Electronics', vi: 'Điện tử' },
  travel: { en: 'Travel', vi: 'Du lịch' },
  home: { en: 'Home', vi: 'Gia dụng' },
};

export function categoryLabel(category: string, lang: 'en' | 'vi' = 'en'): string {
  const labels = CATEGORY_LABELS[category];
  if (!labels) return category;
  return labels[lang];
}

export function formatEndDate(endDate: string | null): string {
  if (!endDate) return 'unknown / chưa rõ';
  return endDate;
}
