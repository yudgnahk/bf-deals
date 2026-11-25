import dealsData from '../data/deals.json';
import affiliatesConfig from '../config/affiliates.json';
import featuredConfig from '../config/featured.json';
import { DEFAULT_REGION_FILTER } from './constants';
import { extractCodes, isAutoApplied } from './promo';
import { formatDiscountBadge, parseDiscountPercent } from './discount';
import { parsePriceParts, type PriceParts } from './price';

export { DEFAULT_REGION_FILTER, formatDiscountBadge, parseDiscountPercent, parsePriceParts };
export type { PriceParts };

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
  /** Date or ISO instant the row was first added; drives the "New" badge. */
  added_at?: string;
}

export type AffSpeed = 'instant' | 'same-day' | 'slow' | 'unknown';

export interface AffiliateProgramConfig {
  id_or_tag: string;
  link_template: string;
  notes?: string;
  /** Officially stated approval speed; see docs/AFFILIATE_QUICKLIST.md. */
  aff_speed?: AffSpeed;
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

/** Vietnam-only deals for the /vn/ page; `hidden` only hides them from the international views. */
export function getVnDeals(today = new Date()): Deal[] {
  return deals.filter((deal) => deal.region === 'vn' && !isDealExpired(deal, today));
}

export function getAllDeals(): Deal[] {
  return deals;
}

/** Builder-first categories (AI / SaaS focus). */
export const CATEGORY_PRIORITY = [
  'ai',
  'dev-tools',
  'saas',
  'productivity',
  'design',
  'marketing',
] as const;

/** Secondary groups after builder cats; travel last. */
export const CATEGORY_SECONDARY = [
  'hosting',
  'vpn',
  'courses',
  'electronics',
  'streaming',
  'home',
  'travel',
] as const;

const PRIMARY_SET = new Set<string>(CATEGORY_PRIORITY);

/** Sort rank: builder cats first, then secondary, then unknown A–Z, travel last. */
export function categoryRank(category: string): number {
  const primary = CATEGORY_PRIORITY.indexOf(
    category as (typeof CATEGORY_PRIORITY)[number]
  );
  if (primary !== -1) return primary;
  const secondary = CATEGORY_SECONDARY.indexOf(
    category as (typeof CATEGORY_SECONDARY)[number]
  );
  if (secondary !== -1) return 100 + secondary;
  return 200;
}

export function isPrimaryCategory(category: string): boolean {
  return PRIMARY_SET.has(category);
}

/** Categories derived from currently visible (non-hidden) deals. */
export function getCategories(list: Deal[] = getVisibleDeals()): string[] {
  const cats = [...new Set(list.map((d) => d.category))];
  return cats.sort((a, b) => {
    const ap = categoryRank(a);
    const bp = categoryRank(b);
    if (ap !== bp) return ap - bp;
    return a.localeCompare(b);
  });
}

export function getCategoryCounts(list: Deal[] = getVisibleDeals()): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const d of list) {
    counts[d.category] = (counts[d.category] || 0) + 1;
  }
  return counts;
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
  streaming: { en: 'Streaming', vi: 'Phim & nhạc' },
  travel: { en: 'Travel', vi: 'Du lịch' },
  home: { en: 'Home', vi: 'Gia dụng' },
};

export function categoryLabel(category: string, lang: 'en' | 'vi' = 'en'): string {
  const labels = CATEGORY_LABELS[category];
  if (!labels) return category;
  return labels[lang];
}

export function formatEndDate(endDate: string | null): string {
  if (!endDate) return 'end date unknown';
  return endDate;
}

/**
 * Default list order: builder categories first, then ending soon within group.
 * Travel / electronics / etc. sink below AI · SaaS · tools.
 */
export function sortEndingSoon(list: Deal[]): Deal[] {
  return [...list].sort((a, b) => {
    const cr = categoryRank(a.category) - categoryRank(b.category);
    if (cr !== 0) return cr;
    const ae = a.end_date || '';
    const be = b.end_date || '';
    if (!ae && !be) return 0;
    if (!ae) return 1;
    if (!be) return -1;
    return ae.localeCompare(be);
  });
}

export function extractPromoCodes(deal: Deal): string[] {
  return extractCodes([deal.discount_text, deal.price, deal.notes]);
}

export function isPromoAutoApplied(deal: Deal, code: string): boolean {
  return isAutoApplied(code, [deal.discount_text, deal.price, deal.notes]);
}

/** Featured / compact surfaces: use only the first tier when price lists multiple plans. */
export function primaryPriceParts(price: string | null): PriceParts {
  if (!price) return { original: null, current: null, raw: null };
  const segment = price.split(/;\s*/)[0]?.trim() || price.trim();
  return parsePriceParts(segment);
}

export function merchantDomain(deal: Deal): string {
  try {
    return new URL(deal.source_url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function faviconUrl(deal: Deal, size = 64): string {
  const host = merchantDomain(deal);
  if (!host) return '';
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=${size}`;
}

/** Calendar days from today to end_date (inclusive of end day). Null if unknown. */
export function daysUntilEnd(endDate: string | null, today = new Date()): number | null {
  if (!endDate) return null;
  const [y, m, d] = endDate.split('-').map(Number);
  if (!y || !m || !d) return null;
  const end = new Date(y, m - 1, d);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = Math.round((end.getTime() - start.getTime()) / 86400000);
  return diff;
}

/** Pinned ids from src/config/featured.json first, then the automatic score. */
export function getFeaturedDeals(list: Deal[], limit = 2): Deal[] {
  const byId = new Map(list.map((d) => [d.id, d]));
  const pinned = (featuredConfig.ids as string[])
    .map((id) => byId.get(id))
    .filter((d): d is Deal => Boolean(d));
  const pinnedIds = new Set(pinned.map((d) => d.id));
  const auto = scoreFeatured(list.filter((d) => !pinnedIds.has(d.id)));
  return [...pinned, ...auto].slice(0, limit);
}

/** Prefer aff-possible builder-category deals: largest % plus an ending-soon boost. */
function scoreFeatured(list: Deal[]): Deal[] {
  const aff = list.filter((d) => d.aff_status === 'aff-possible');
  const primary = aff.filter((d) => isPrimaryCategory(d.category));
  const pool = [...primary, ...aff.filter((d) => !isPrimaryCategory(d.category))];
  return pool
    .map((d) => {
      const pct = parseDiscountPercent(d.discount_text) ?? -1;
      const days = daysUntilEnd(d.end_date);
      const soonBoost = days !== null && days >= 0 && days <= 7 ? 20 - days : 0;
      const catBoost = isPrimaryCategory(d.category) ? 50 : 0;
      return { d, score: pct + soonBoost + catBoost };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        (a.d.end_date || '9999').localeCompare(b.d.end_date || '9999')
    )
    .map(({ d }) => d);
}

export function sortByBiggestDiscount(list: Deal[]): Deal[] {
  return [...list].sort((a, b) => {
    const cr = categoryRank(a.category) - categoryRank(b.category);
    if (cr !== 0) return cr;
    const ap = parseDiscountPercent(a.discount_text) ?? -1;
    const bp = parseDiscountPercent(b.discount_text) ?? -1;
    if (bp !== ap) return bp - ap;
    return (a.end_date || '9999').localeCompare(b.end_date || '9999');
  });
}

export const BLACK_FRIDAY = '2026-11-27';
export const CYBER_MONDAY = '2026-11-30';
