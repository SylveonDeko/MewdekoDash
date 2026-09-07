import DOMPurify from "dompurify";
import { marked } from "marked";

/**
 * Renders the text a guild writes on a form as a small, safe subset of Markdown.
 *
 * Question text is written by a guild's staff but read by anyone holding the form's link, so on
 * the public page it is untrusted input. Raw HTML never survives the sanitizer, and every link
 * and image address is checked, which together mean a question cannot carry script into the page.
 */

/** Tags a question may use. Anything else is stripped, its text content kept. */
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "del",
  "code",
  "pre",
  "blockquote",
  "ul",
  "ol",
  "li",
  "a",
  "h1",
  "h2",
  "h3",
  "h4",
  "hr",
  "span",
];

const ALLOWED_ATTR = ["href", "title", "target", "rel"];

/**
 * Whether an address may be linked to. Only absolute http and https addresses qualify, which
 * rules out javascript and data URLs.
 *
 * @param url The address to check.
 * @returns True when the address is safe to render.
 */
export function isSafeUrl(url: string | null | undefined): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Renders form text as sanitized HTML.
 *
 * @param text The text to render, which may be empty.
 * @returns HTML safe to insert into the page.
 */
export function renderFormText(text: string | null | undefined): string {
  if (!text || !text.trim()) return "";

  const parsed = marked.parse(text, { async: false, breaks: true, gfm: true }) as string;

  const clean = DOMPurify.sanitize(parsed, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // A question is a sentence, not a document, so anything that could reach outside the page
    // is refused outright rather than filtered.
    FORBID_TAGS: ["style", "script", "iframe", "object", "embed", "form", "input"],
    FORBID_ATTR: ["style", "onerror", "onload", "onclick"],
  });

  // Links open away from the form, so following one never costs somebody the answers they have
  // already typed.
  return clean.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer nofollow" ');
}

/**
 * Renders form text with every tag stripped, for the places that want one plain line: a page
 * title, a summary row, the review step.
 *
 * @param text The text to flatten.
 * @returns The text with its formatting removed.
 */
export function renderFormTextPlain(text: string | null | undefined): string {
  if (!text || !text.trim()) return "";

  return DOMPurify.sanitize(marked.parse(text, { async: false, gfm: true }) as string, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim();
}
