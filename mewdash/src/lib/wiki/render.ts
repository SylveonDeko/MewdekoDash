import { marked } from "marked";
import { m } from "$lib/i18n";
import type { WikiHeading } from "./types";

/**
 * Turns wiki Markdown into HTML the article component can drop straight into the page.
 *
 * Articles ship inside the repository and are reviewed like code, so the input is trusted and
 * the output is bound directly without a sanitizer pass.
 */

/** Labels for the callout blocks. Resolved when an article is rendered, so they follow the active locale. */
function calloutLabel(kind: string): string {
  switch (kind) {
    case "TIP": return m.wiki.calloutTip();
    case "NOTE": return m.wiki.calloutNote();
    case "WARNING": return m.common.warning();
    case "PERMISSION": return m.wiki.calloutPermission();
    case "EXAMPLE": return m.wiki.calloutExample();
    default: return kind;
  }
}

/**
 * Produces a stable anchor id from heading text.
 *
 * @param text Plain heading text.
 * @returns A lowercase id safe to use in a URL fragment.
 */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

/**
 * Adds ids to h2 and h3 elements and collects them for a table of contents.
 */
function addHeadingIds(html: string): { html: string; headings: WikiHeading[] } {
  const headings: WikiHeading[] = [];
  const used = new Set<string>();

  const withIds = html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_match, level: string, inner: string) => {
    const text = stripTags(inner);
    let id = slugifyHeading(text) || "section";
    let n = 2;
    while (used.has(id)) {
      id = `${slugifyHeading(text)}-${n++}`;
    }
    used.add(id);
    headings.push({ id, text, level: Number(level) as 2 | 3 });
    return `<h${level} id="${id}"><a class="wiki-anchor" href="#${id}" aria-hidden="true">#</a>${inner}</h${level}>`;
  });

  return { html: withIds, headings };
}

/**
 * Converts GitHub style `> [!TIP]` blockquotes into styled callout boxes.
 */
function convertCallouts(html: string): string {
  const opener = /<blockquote>\s*<p>\[!(TIP|NOTE|WARNING|PERMISSION|EXAMPLE)\]\s*/g;
  let result = "";
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = opener.exec(html)) !== null) {
    const kind = match[1];
    const start = match.index;
    const closeIndex = html.indexOf("</blockquote>", start);
    if (closeIndex === -1) break;

    const body = html.slice(start + match[0].length, closeIndex);
    const cls = kind.toLowerCase();
    result += html.slice(cursor, start);
    result += `<div class="wiki-callout wiki-callout-${cls}"><div class="wiki-callout-label">${calloutLabel(kind)}</div><p>${body}</div>`;
    cursor = closeIndex + "</blockquote>".length;
    opener.lastIndex = cursor;
  }

  return result + html.slice(cursor);
}

/**
 * Renders article Markdown.
 *
 * @param markdown The article body.
 * @returns HTML plus the headings found in it.
 */
export function renderWikiMarkdown(markdown: string): { html: string; headings: WikiHeading[] } {
  const raw = marked.parse(markdown, { async: false, gfm: true, breaks: false }) as string;
  const withCallouts = convertCallouts(raw);
  const { html, headings } = addHeadingIds(withCallouts);
  const wrappedTables = html
    .replace(/<table>/g, '<div class="wiki-table"><table>')
    .replace(/<\/table>/g, "</table></div>");
  return { html: wrappedTables.replace(/<a href="http/g, '<a target="_blank" rel="noopener noreferrer" href="http'), headings };
}
