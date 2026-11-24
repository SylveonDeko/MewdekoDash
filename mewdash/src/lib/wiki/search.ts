import type { CatalogVersion, ResolvedEntry } from "./catalog.ts";

export const searchLimits = { queryMin: 2, queryMax: 100, hits: 20, snippet: 160 } as const;

export interface SearchHit {
  slug: string;
  title: string;
  summary: string;
  icon: string;
  category: string;
  snippet: string;
}

const fence = /```[^\n]*\n?|~~~[^\n]*\n?/g;
const links = /!?\[([^\[\]]{0,500})\]\([^)]{0,500}\)/g;
const tableRule = /^[ \t]*(?:\|[ \t]*)?:?-{2,}:?[ \t]*(?:\|[ \t]*:?-{2,}:?[ \t]*)*(?:\|[ \t]*)?$/gm;
const lineMarker = /^[ \t]{0,3}(?:#{1,6}[ \t]+|>[ \t]?(?:\[![A-Z]+\][ \t]*)?|[-*+][ \t]+(?:\[[ xX]\][ \t]+)?|\d{1,9}\.[ \t]+)/gm;
const inlineMarker = /[*_~`|]/g;

/**
 * Strips Markdown syntax roughly, leaving the words on a single line.
 *
 * @param markdown The article body.
 */
export function toPlainText(markdown: string): string {
  return markdown
    .replace(fence, "\n")
    .replace(links, "$1")
    .replace(tableRule, "")
    .replace(lineMarker, "")
    .replace(inlineMarker, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * A short piece of text around a match, with ellipses where it was cut.
 *
 * @param text The plain text.
 * @param index Where the match starts, or a negative number when there is none.
 * @param fallback What to show when there is no match in the text.
 */
export function snippetAround(text: string, index: number, fallback: string): string {
  if (index < 0) return fallback;
  const size = searchLimits.snippet;
  const start = Math.max(0, index - Math.floor(size / 4));
  const end = Math.min(text.length, start + size);
  const cut = text.slice(start, end).trim();
  return `${start > 0 ? "…" : ""}${cut}${end < text.length ? "…" : ""}`;
}

const plainCache = new WeakMap<CatalogVersion, string>();

function plainOf(version: CatalogVersion): string {
  let plain = plainCache.get(version);
  if (plain === undefined) {
    plain = toPlainText(version.markdown);
    plainCache.set(version, plain);
  }
  return plain;
}

/**
 * Splits a query into lower case search terms. Queries outside the length limits give no terms.
 *
 * @param query What the reader typed.
 */
export function searchTerms(query: string): string[] {
  const trimmed = query.trim();
  if ([...trimmed].length < searchLimits.queryMin || trimmed.length > searchLimits.queryMax) return [];
  return trimmed.toLowerCase().split(/\s+/).filter(Boolean);
}

/**
 * Searches article titles, summaries, categories, modules, tags and body text. Every term has to
 * appear somewhere in the article. Titles rank first, then tags, then the display order.
 *
 * @param entries The articles in display order.
 * @param query What the reader typed.
 */
export function searchEntries(entries: readonly ResolvedEntry[], query: string): SearchHit[] {
  const terms = searchTerms(query);
  if (terms.length === 0) return [];

  const found: Array<{ rank: number; hit: SearchHit }> = [];
  for (const { page, version } of entries) {
    const title = version.title.toLowerCase();
    const tags = version.tags.join(" ").toLowerCase();
    const plain = plainOf(version);
    const body = plain.toLowerCase();
    const meta = `${title} ${version.summary} ${page.category} ${page.module ?? ""} ${tags}`.toLowerCase();

    if (!terms.every((term) => meta.includes(term) || body.includes(term))) continue;

    const rank = terms.every((term) => title.includes(term)) ? 0 : terms.every((term) => tags.includes(term)) ? 1 : 2;
    const index = terms.map((term) => body.indexOf(term)).find((at) => at >= 0) ?? -1;
    found.push({
      rank,
      hit: {
        slug: page.slug,
        title: version.title,
        summary: version.summary,
        icon: page.icon,
        category: page.category,
        snippet: snippetAround(plain, index, version.summary),
      },
    });
  }

  return found
    .map((item, order) => ({ ...item, order }))
    .sort((a, b) => a.rank - b.rank || a.order - b.order)
    .slice(0, searchLimits.hits)
    .map((item) => item.hit);
}
