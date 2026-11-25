/** First % number found in discount_text (for sorting / badge preference). Never invents. */
export function parseDiscountPercent(discountText: string | null): number | null {
  if (!discountText) return null;
  const m = discountText.match(/(\d{1,3})\s*%/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

/**
 * Short badge label only when a % is present in discount_text.
 * e.g. "-20%", "up to 78%". Long slogans stay as secondary text, never a pill.
 */
export function formatDiscountBadge(discountText: string | null): string | null {
  if (!discountText) return null;
  const all = [...discountText.matchAll(/(\d{1,3})\s*%/g)].map((m) => Number(m[1]));
  if (all.length === 0) return null;
  const max = Math.max(...all);
  // Tiered offers ("15% off one, 25% off three") advertise the top tier, never the first number.
  const tiered = new Set(all).size > 1;
  const upTo = tiered || /\bup\s+to\b/i.test(discountText) || /(?:^|\s)đến(?=\s|$)/i.test(discountText);
  return upTo ? `up to ${max}%` : `-${max}%`;
}
