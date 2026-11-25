// Research notes mix shopper terms with editor remarks; these mark the editor-only sentences.
const INTERNAL = /\b(?:this (?:fetch|session)|re-?check(?:ed)?|checker|affiliate|accesstrade|did not render|not rendered|static html|rendered|fetch(?:ed)?|prior vendor|do not use|treat(?:ed)? as|hook|kept \d+%|until the body|third-party|not used|taken only|uncertain|extracted|appear to be|automated|bot wall)\b/i;

/** Notes with editor-only sentences removed; null when nothing shopper-facing is left. */
export function publicNotes(notes: string | null | undefined): string | null {
  if (!notes) return null;
  const kept = notes
    .split(/(?<=[.;!?])\s+/)
    .filter((sentence) => !INTERNAL.test(sentence))
    .join(' ')
    .trim()
    .replace(/;$/, '.');
  return kept || null;
}
