import { Marked } from "marked";
import { escapeHtml, sanitizeHtml } from "./sanitize.ts";
import type { WikiHeading } from "./types.ts";

/**
 * Turns wiki Markdown into HTML the article component can drop straight into the page.
 *
 * Articles are written by editors and by any signed in member through suggestions, so the input
 * is untrusted. Raw HTML in the Markdown is shown as text, and the finished HTML goes through
 * {@link sanitizeHtml} before it is returned.
 */
const parser = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    html({ text }) {
      return escapeHtml(text);
    },
  },
});

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
function convertCallouts(html: string, label: (kind: string) => string): string {
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
    result += `<div class="wiki-callout wiki-callout-${cls}"><div class="wiki-callout-label">${escapeHtml(label(kind))}</div><p>${body}</div>`;
    cursor = closeIndex + "</blockquote>".length;
    opener.lastIndex = cursor;
  }

  return result + html.slice(cursor);
}

/**
 * Renders article Markdown.
 *
 * @param markdown The article body.
 * @param calloutLabel Gives the heading of a callout block for its kind, in the viewer's language.
 * @returns Sanitised HTML plus the headings found in it.
 */
export function renderMarkdown(markdown: string, calloutLabel: (kind: string) => string): { html: string; headings: WikiHeading[] } {
  const raw = parser.parse(markdown, { async: false }) as string;
  const withCallouts = convertCallouts(raw, calloutLabel);
  const { html, headings } = addHeadingIds(withCallouts);
  const wrappedTables = html
    .replace(/<table>/g, '<div class="wiki-table"><table>')
    .replace(/<\/table>/g, "</table></div>");
  return { html: sanitizeHtml(wrappedTables), headings };
}
