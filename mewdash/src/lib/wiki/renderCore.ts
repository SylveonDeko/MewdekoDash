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

const exampleOutside = new Set(["message", "button", "trigger", "select"]);
const exampleInside = new Set(["author", "title", "description", "field", "image", "thumbnail", "footer", "color"]);
const exampleBlock = /<pre><code class="language-embed-example">([\s\S]*?)<\/code><\/pre>/g;
const exampleLimits = { lines: 30, label: 60, text: 400 };

function decodeCodeText(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function exampleRow(kind: string, label: string, text: string): string {
  return (
    `<div class="wiki-example-row"><div class="wiki-example-label">${escapeHtml(label)}</div>` +
    `<div class="wiki-example-part wiki-example-part-${kind}">${escapeHtml(text)}</div></div>`
  );
}

/**
 * Turns a fenced `embed-example` block into a labelled picture of a message. Each line is
 * `kind | label | text`, where kind is one of message, author, title, description, field, image,
 * thumbnail, footer, color, button, trigger or select. Lines with another kind are dropped, and
 * the label and text are escaped, so the block cannot carry markup or styles.
 */
function convertExamples(html: string): string {
  return html.replace(exampleBlock, (_match, body: string) => {
    const lines = decodeCodeText(body).split("\n").slice(0, exampleLimits.lines);
    let out = '<div class="wiki-example">';
    let card = "";

    const flushCard = () => {
      if (card) out += `<div class="wiki-example-card">${card}</div>`;
      card = "";
    };

    for (const line of lines) {
      const parts = line.split("|").map((part) => part.trim());
      if (parts.length < 2) continue;
      const kind = parts[0].toLowerCase();
      const label = parts[1].slice(0, exampleLimits.label);
      const text = parts.slice(2).join("|").trim().slice(0, exampleLimits.text);

      if (exampleInside.has(kind)) {
        card += exampleRow(kind, label, text);
      } else if (exampleOutside.has(kind)) {
        flushCard();
        out += exampleRow(kind, label, text);
      }
    }

    flushCard();
    return out + "</div>";
  });
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
  const withCallouts = convertCallouts(convertExamples(raw), calloutLabel);
  const { html, headings } = addHeadingIds(withCallouts);
  const wrappedTables = html
    .replace(/<table>/g, '<div class="wiki-table"><table>')
    .replace(/<\/table>/g, "</table></div>");
  return { html: sanitizeHtml(wrappedTables), headings };
}
