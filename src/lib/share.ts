import { SITE_NAME } from './seo.ts';

export interface ShareDeal {
  id: string;
  title: string;
  merchant: string;
  category: string;
  discount_text: string | null;
  price: string | null;
  end_date: string | null;
  source_url: string;
  verified_at: string;
}

export interface ShareTarget {
  name: string;
  href: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function dealPath(id: string): string {
  return `/deal/${id}/`;
}

function shortEndDate(endDate: string, lang: 'en' | 'vi'): string | null {
  const [, m, d] = endDate.split('-').map(Number);
  if (!m || !d || m > 12) return null;
  return lang === 'vi' ? `hết hạn ${d}/${m}` : `ends ${d} ${MONTHS[m - 1]}`;
}

/** One-line text for share sheets; falls back to the title when no discount is printed. */
export function dealShareText(deal: ShareDeal, lang: 'en' | 'vi' = 'en'): string {
  if (!deal.discount_text) return deal.title;
  const ends = deal.end_date ? shortEndDate(deal.end_date, lang) : null;
  const parts = [`${deal.merchant}: ${deal.discount_text}`, deal.price, ends].filter(Boolean);
  return parts.join(' · ');
}

export function dealPageTitle(deal: ShareDeal): string {
  const head = deal.discount_text
    ? `${deal.merchant}: ${deal.discount_text} — Black Friday 2026`
    : deal.title;
  return `${head} | ${SITE_NAME}`;
}

export function dealPageDescription(deal: ShareDeal): string {
  const parts = [
    deal.title,
    deal.price ? `Price: ${deal.price}.` : null,
    deal.end_date ? `Ends ${deal.end_date}.` : null,
    `Copied from the official ${deal.merchant} page, checked ${deal.verified_at}.`,
  ];
  return parts.filter(Boolean).join(' ');
}

export function shareTargets(url: string, text: string): ShareTarget[] {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  return [
    { name: 'X', href: `https://x.com/intent/post?url=${u}&text=${t}` },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: 'Telegram', href: `https://t.me/share/url?url=${u}&text=${t}` },
    { name: 'Reddit', href: `https://www.reddit.com/submit?url=${u}&title=${t}` },
  ];
}

/** schema.org Offer for one deal page; `url` is the merchant page the offer lives on. */
export function buildOfferJsonLd(deal: ShareDeal, pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: deal.title,
    url: deal.source_url,
    mainEntityOfPage: pageUrl,
    category: deal.category,
    ...(deal.discount_text ? { description: deal.discount_text } : {}),
    ...(deal.end_date ? { validThrough: `${deal.end_date}T23:59:59+07:00` } : {}),
    seller: { '@type': 'Organization', name: deal.merchant },
  };
}
