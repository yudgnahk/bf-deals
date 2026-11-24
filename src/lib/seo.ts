export const SITE_NAME = 'BF Deals 2026';
export const DEFAULT_OG_IMAGE = '/og/site.png';
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

/** Slugs that have a pre-rendered card in public/og/ (see scripts/gen-og.mjs). */
export const OG_CATEGORY_SLUGS = [
  'ai',
  'dev-tools',
  'saas',
  'productivity',
  'design',
  'marketing',
  'hosting',
  'vpn',
  'courses',
  'electronics',
  'travel',
  'home',
] as const;

interface SeoDeal {
  id: string;
  title: string;
  merchant: string;
  category: string;
  discount_text: string | null;
  end_date: string | null;
  source_url: string;
}

export function categoryPath(slug: string): string {
  return `/category/${slug}/`;
}

export function ogImageFor(slug: string): string {
  return (OG_CATEGORY_SLUGS as readonly string[]).includes(slug)
    ? `/og/${slug}.png`
    : DEFAULT_OG_IMAGE;
}

export function categoryTitle(label: string, count: number): string {
  return `Black Friday 2026 ${label} deals — ${count} offers checked | ${SITE_NAME}`;
}

export function categoryDescription(label: string, count: number, lastChecked: string): string {
  const checked = lastChecked ? `, last checked ${lastChecked}` : '';
  return `${count} Black Friday & Cyber Monday 2026 ${label.toLowerCase()} deals, copied from official merchant pages${checked}. Prices, codes and end dates as printed — nothing invented.`;
}

/** Escape a JSON-LD payload so it cannot close the surrounding <script>. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** schema.org ItemList of Offers; `url` points at the on-site anchor, `offers.url` at the merchant. */
export function buildItemListJsonLd(
  deals: readonly SeoDeal[],
  opts: { name: string; pageUrl: string }
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: opts.name,
    url: opts.pageUrl,
    numberOfItems: deals.length,
    itemListElement: deals.map((deal, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${opts.pageUrl}#deal-${deal.id}`,
      item: {
        '@type': 'Offer',
        name: deal.title,
        url: deal.source_url,
        category: deal.category,
        ...(deal.discount_text ? { description: deal.discount_text } : {}),
        ...(deal.end_date ? { validThrough: `${deal.end_date}T23:59:59+07:00` } : {}),
        seller: { '@type': 'Organization', name: deal.merchant },
      },
    })),
  };
}

export function buildBreadcrumbJsonLd(items: readonly { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildWebsiteJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: `${siteUrl}/`,
    inLanguage: ['en', 'vi'],
  };
}
