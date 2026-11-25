const CODE_PATTERNS = [
  /\b(?:(?:use|enter|apply)\s+(?:the\s+)?(?:promo\s+|coupon\s+)?code|promo\s+code|coupon\s+code|with\s+(?:code|coupon)|uses\s+code)\s*[:=]?\s*([A-Za-z0-9][A-Za-z0-9_-]{2,})\b/gi,
  /\bCodes?:\s*([A-Za-z0-9][A-Za-z0-9_-]{2,})\s*=/g,
  /\b[Cc]ode\s+([A-Za-z0-9][A-Za-z0-9_-]{2,})\b/g,
];

const STOP_WORDS = new Set(['OFF', 'THE', 'AND', 'FOR', 'WITH', 'FROM', 'NEW', 'OLD', 'USD', 'VND', 'NEEDED',
  'OFFICIAL', 'HERE', 'BELOW', 'MUST', 'ONLY', 'APPLIED', 'ENTERED', 'FREE', 'AUTO', 'AUTOMATICALLY']);

const NEGATED_BEFORE = [/\bno\s+$/, /without\s+(a\s+)?$/, /invent\s+$/, /earlier\s+note\s+listed\s+$/];

/** Real codes carry a digit or are written in capitals; "code works" / "code already" are prose. */
function looksLikeCode(token: string): boolean {
  if (/\d/.test(token)) return true;
  return token.length >= 4 && token === token.toUpperCase();
}

/** Pull clearly labeled promo codes ("code XYZ", "with code XYZ") from free text. Never guesses. */
export function extractCodes(texts: readonly (string | null | undefined)[]): string[] {
  const text = texts.filter(Boolean).join('\n');
  if (!text) return [];

  const seen = new Set<string>();
  const codes: string[] = [];
  for (const re of CODE_PATTERNS) {
    for (const m of text.matchAll(re)) {
      const index = m.index ?? 0;
      const before = text.slice(Math.max(0, index - 32), index).toLowerCase();
      if (NEGATED_BEFORE.some((neg) => neg.test(before))) continue;
      const after = text.slice(index + m[0].length, index + m[0].length + 18).toLowerCase();
      if (/^\s*(needed|required|is no longer)\b/.test(after)) continue;

      const raw = m[1];
      const key = raw.toUpperCase();
      if (!looksLikeCode(raw) || seen.has(key) || STOP_WORDS.has(key)) continue;
      seen.add(key);
      codes.push(raw);
    }
  }
  return codes;
}

const AUTO_APPLIED = /\bautomatic(?:ally)?\b|\bpre-?applied\b|\balready applied\b|\badded when\b/i;
const NOT_AUTO = /\bnot (?:applied )?automatic|\bnot (?:pre-?)?applied\b|\bmust be (?:entered|typed)\b|\benter(?:ed)? manually\b/i;

/** True when the sentence naming the code says the merchant applies it without typing. */
export function isAutoApplied(code: string, texts: readonly (string | null | undefined)[]): boolean {
  const sentences = texts.filter(Boolean).join('\n').split(/(?<=[.;!?])\s+|\n/);
  const about = sentences.filter((s) => s.includes(code));
  if (about.some((s) => NOT_AUTO.test(s))) return false;
  return about.some((s) => AUTO_APPLIED.test(s));
}
