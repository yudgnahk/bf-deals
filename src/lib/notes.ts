// Research notes mix shopper terms with editor remarks; these mark the editor-only sentences.
const INTERNAL = new RegExp(
  [
    'this (?:fetch|session|entry)',
    're-?check(?:ed)?',
    'checker',
    'affiliate',
    'accesstrade',
    'partnerstack',
    'partners?\\.',
    'publisher program',
    'referrals? (?:are|is)',
    'refer-a-friend',
    'join url',
    'signup url',
    'decision email',
    'deals? (?:site|website)s?',
    'confirm (?:the )?(?:live|current|official|whether)',
    'did not render',
    'not rendered',
    'rendered',
    'static html',
    'fetch(?:ed)?',
    'extract\\w*',
    'taken from',
    'not the timer',
    'is what is used',
    'campaign-level',
    'search snippet',
    'when checked',
    'as of this',
    '\\d{4} check',
    'prior vendor',
    'do not (?:use|invent|treat)',
    'treat(?:ed)? as',
    'hook',
    'kept \\d+%',
    'until the body',
    'third-party',
    'not used',
    'not added',
    'should not be used',
    'taken only',
    'uncertain',
    'appear to be',
    'automated',
    'bot wall',
  ].join('|'),
  'i'
);
const URL_IN_TEXT = /https?:\/\//i;

function balancedParens(text: string): boolean {
  return (text.match(/\(/g) ?? []).length === (text.match(/\)/g) ?? []).length;
}

function keepClause(clause: string): boolean {
  return !INTERNAL.test(clause) && !URL_IN_TEXT.test(clause) && balancedParens(clause);
}

// Clauses are filtered inside each sentence; a sentence that then starts lowercase is a leftover.
function cleanSentence(sentence: string): string | null {
  const kept = sentence.split(/(?<=;)\s+/).filter(keepClause).join(' ').trim();
  if (!kept || /^[a-z]/.test(kept)) return null;
  return kept.replace(/;$/, '.');
}

/** Notes with editor-only sentences removed; null when nothing shopper-facing is left. */
export function publicNotes(notes: string | null | undefined): string | null {
  if (!notes) return null;
  const kept = notes
    .split(/(?<=[.!?])\s+/)
    .map(cleanSentence)
    .filter((s): s is string => s !== null)
    .join(' ')
    .trim();
  return kept || null;
}
