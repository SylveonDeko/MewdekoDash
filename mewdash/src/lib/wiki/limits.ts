export const complexityLimits = {
  headings: 1000,
  bracketWork: 200_000_000,
  quoteDepth: 12,
  indentDepth: 24,
  images: 100,
  lineLength: 20_000,
  outputFactor: 40,
  outputSlack: 20_000,
} as const;

/**
 * Whether Markdown would take the renderer far longer than its size suggests: text with very
 * many open brackets or headings, deeply nested quotes or lists, a very long line or very many
 * images. Such text is not rendered; it is shown as plain text instead and refused when saved.
 *
 * @param markdown The Markdown to check.
 */
export function isTooComplex(markdown: string): boolean {
  if (markdown.length === 0) return false;

  let brackets = 0;
  for (let i = 0; i < markdown.length; i++) if (markdown.charCodeAt(i) === 91) brackets++;
  if (brackets * markdown.length > complexityLimits.bracketWork) return true;

  let headings = 0;
  let images = 0;
  let start = 0;
  while (start <= markdown.length) {
    let end = markdown.indexOf("\n", start);
    if (end === -1) end = markdown.length;
    const line = markdown.slice(start, end);
    start = end + 1;

    if (line.length > complexityLimits.lineLength) return true;

    const text = line.trimStart();
    if (line.length - text.length > complexityLimits.indentDepth * 4) return true;
    if (text.startsWith("#") || /^(?:=+|-+)\s*$/.test(text)) {
      headings++;
      if (headings > complexityLimits.headings) return true;
    }

    let depth = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === ">") depth++;
      else if (char !== " ") break;
    }
    if (depth > complexityLimits.quoteDepth) return true;

    for (let at = text.indexOf("!["); at !== -1; at = text.indexOf("![", at + 2)) {
      images++;
      if (images > complexityLimits.images) return true;
    }
  }
  return false;
}

/**
 * Whether rendered HTML is far larger than its source, which only happens when the parser was
 * pushed into repeating work.
 *
 * @param markdown The source.
 * @param html What it rendered to.
 */
export function outputTooLarge(markdown: string, html: string): boolean {
  return html.length > markdown.length * complexityLimits.outputFactor + complexityLimits.outputSlack;
}
