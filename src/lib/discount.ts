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
  const pct = parseDiscountPercent(discountText);
  if (pct === null) return null;
  const upTo = /\bup\s+to\b/i.test(discountText) || /\bđến\b/i.test(discountText);
  return upTo ? `up to ${pct}%` : `-${pct}%`;
}
