export interface PriceParts {
  /** Full original price string when both old+new are present in data */
  original: string | null;
  /** Sale / current price string, or the sole price when only one is present */
  current: string | null;
  /** Raw price field when we cannot split safely */
  raw: string | null;
}

// An amount counts only with a currency mark, so "2-year" or "3 months" never parse as money.
const CURRENCY_AMOUNT = /[$€£₫]\s?(\d[\d,]*(?:\.\d+)?)|(\d[\d.,]*)\s?(đ|₫|VND|USD|EUR|GBP)(?![a-z])/i;

/** VND writes thousands with dots ("1.990.000đ"); other suffixed currencies use dot decimals. */
function suffixDigits(digits: string, suffix: string): string {
  return /^(?:đ|₫|vnd)$/i.test(suffix) ? digits.replace(/[.,]/g, '') : digits.replace(/,/g, '');
}

/** Extract a comparable numeric amount from a money-like token. */
function moneyValue(token: string): number | null {
  const m = token.match(CURRENCY_AMOUNT);
  if (!m) return null;
  const digits = m[1] !== undefined ? m[1].replace(/,/g, '') : suffixDigits(m[2], m[3]);
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}

function balancedParens(text: string): boolean {
  return (text.match(/\(/g) ?? []).length === (text.match(/\)/g) ?? []).length;
}

/**
 * Only pair original + current for strikethrough when both parse and original > current.
 * Otherwise return raw (no strikethrough). Never invents prices.
 */
function asStrikePair(
  original: string,
  current: string,
  raw: string
): PriceParts {
  const ov = moneyValue(original);
  const cv = moneyValue(current);
  if (ov !== null && cv !== null && ov > cv && balancedParens(original) && balancedParens(current)) {
    return { original, current, raw };
  }
  return { original: null, current: null, raw };
}

/**
 * Split a price string into original + current only when both are clearly present
 * and original is higher than the sale price. Never invents or computes a missing side.
 */
export function parsePriceParts(price: string | null): PriceParts {
  if (!price) return { original: null, current: null, raw: null };
  const trimmed = price.trim();
  // Pair only the first clause: "…, or $294 instead of $588" is a second offer, not the list price.
  const head = trimmed.split(/;|,\s*or\s/i)[0].trim();

  // "Original price: $3.99 Current price: $2.99"
  const labeled = head.match(
    /Original\s+price:\s*([^\n]+?)\s+Current\s+price:\s*([^\n]+)/i
  );
  if (labeled) {
    return asStrikePair(labeled[1].trim(), labeled[2].trim(), trimmed);
  }

  // "$79.20 instead of $198" / "$29 instead of $99" (sale first, list second)
  const instead = head.match(
    /^(.+?)\s+instead\s+of\s+(.+)$/i
  );
  if (instead) {
    return asStrikePair(instead[2].trim(), instead[1].trim(), trimmed);
  }

  // "$79.20 vs $198" when notes/order imply sale vs list — prefer larger as original
  const vs = head.match(/^(.+?)\s+vs\.?\s+(.+)$/i);
  if (vs) {
    const a = vs[1].trim();
    const b = vs[2].trim();
    const av = moneyValue(a);
    const bv = moneyValue(b);
    if (av !== null && bv !== null) {
      return av > bv ? asStrikePair(a, b, trimmed) : asStrikePair(b, a, trimmed);
    }
  }

  // "$69 → $29" / "$330 → $132"
  const arrow = head.match(/^(.+?)\s*(?:→|->|—|–)\s*(.+)$/);
  if (arrow) {
    return asStrikePair(arrow[1].trim(), arrow[2].trim(), trimmed);
  }

  // Two money-like tokens: "$12.99 $1.99/mo" — first list, second sale when first > second
  const money =
    /(?:\$|€|£|₫)\s?\d[\d,]*(?:\.\d+)?(?:\s*\/\s*(?:mo(?:nth)?|yr|year|1st\s*yr))?/gi;
  const matches = head.match(money);
  if (matches && matches.length >= 2) {
    const first = matches[0].trim();
    const second = matches[1].trim();
    const fv = moneyValue(first);
    const sv = moneyValue(second);
    // Only adjacent amounts read as list → sale; "$14.99 / $12.99" or "and" are two plans or terms.
    const between = head.slice(head.indexOf(first) + first.length, head.indexOf(second, head.indexOf(first) + first.length));
    const adjacent = /^(?:\s|save\s+\d+%|sale|now|from)*$/i.test(between);
    if (fv !== null && sv !== null && fv > sv && adjacent) {
      const secondIdx = head.indexOf(second, head.indexOf(first) + first.length);
      const current = head.slice(secondIdx).trim();
      return asStrikePair(first, current, trimmed);
    }
    // Sale-first phrasing already handled above; don't invent a strike pair
  }

  return { original: null, current: null, raw: trimmed };
}

const CURRENCY_CODES: Record<string, string> = {
  $: 'USD', '€': 'EUR', '£': 'GBP', '₫': 'VND', đ: 'VND', vnd: 'VND', usd: 'USD', eur: 'EUR', gbp: 'GBP',
};
const AMOUNTS = new RegExp(CURRENCY_AMOUNT.source.replace('[$€£₫]', '([$€£₫])'), 'gi');

function amountsIn(text: string): { price: string; priceCurrency: string }[] {
  return [...text.matchAll(AMOUNTS)].map((m) =>
    m[1] !== undefined
      ? { price: m[2].replace(/,/g, ''), priceCurrency: CURRENCY_CODES[m[1]] }
      : { price: suffixDigits(m[3], m[4]), priceCurrency: CURRENCY_CODES[m[4].toLowerCase()] }
  );
}

/** schema.org price for the sale side; null unless one sale amount is unambiguous. */
export function offerPrice(price: string | null): { price: string; priceCurrency: string } | null {
  if (!price) return null;
  const parts = parsePriceParts(price);
  if (parts.original && parts.current) return amountsIn(parts.current)[0] ?? null;
  // A lone amount labelled as the pre-discount or regular price is not what the buyer pays.
  if (/\b(?:before|regular|list price|not printed)\b/i.test(price)) return null;
  const all = amountsIn(price);
  return all.length === 1 ? all[0] : null;
}
