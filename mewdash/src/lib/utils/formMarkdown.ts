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
  "img",
];

const ALLOWED_ATTR = ["href", "title", "target", "rel", "src", "alt"];

const EMOTE_TITLE = "form-emote";
const EMOTE_PATTERN = /<(a?):(\w{2,32}):(\d{17,20})>/g;
const IMAGE_PATTERN = /!\[[^\]]*\]\(\s*<?([^\s)>]+)/g;
const DISCORD_CDN_HOSTS = ["cdn.discordapp.com", "media.discordapp.net"];

/** Maps the address of a picture as written to the address the page loads it from. */
export type ImageLinks = Record<string, string>;

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
 * Whether Discord's own CDN serves an address, which the page loads directly.
 *
 * @param url The address to check.
 * @returns True for an https address on an exact CDN host.
 */
export function isDiscordCdnUrl(url: string | null | undefined): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && !parsed.username && !parsed.password && !parsed.port && DISCORD_CDN_HOSTS.includes(parsed.hostname);
  } catch {
    return false;
  }
}

/**
 * Finds the pictures a piece of form text shows, so the page can ask for their addresses in one go.
 *
 * @param text The text to scan.
 * @returns The addresses written as Markdown pictures.
 */
export function findImageUrls(text: string | null | undefined): string[] {
  if (!text) return [];

  return [...text.matchAll(IMAGE_PATTERN)].map((match) => match[1]);
}

/**
 * Gives the address a picture is loaded from.
 *
 * @param url The address as the form owner wrote it.
 * @param links The signed addresses the page was given.
 * @returns The address to load, or null when the picture must not be shown.
 */
export function imageSource(url: string | null | undefined, links: ImageLinks = {}): string | null {
  if (!url || !isSafeUrl(url)) return null;
  if (isDiscordCdnUrl(url)) return url;

  return links[url] ?? null;
}

/** Turns a custom Discord emote into a picture of it, which is only ever loaded from Discord's CDN. */
function expandEmotes(text: string): string {
  return text.replace(
    EMOTE_PATTERN,
    (_match, animated: string, name: string, id: string) =>
      `![:${name}:](https://cdn.discordapp.com/emojis/${id}.${animated ? "gif" : "png"} "${EMOTE_TITLE}")`,
  );
}

/**
 * Renders form text as sanitized HTML.
 *
 * @param text The text to render, which may be empty.
 * @param links The signed addresses for outside pictures. A picture with none is left out.
 * @returns HTML safe to insert into the page.
 */
export function renderFormText(text: string | null | undefined, links: ImageLinks = {}): string {
  if (!text || !text.trim()) return "";

  const parsed = marked.parse(expandEmotes(text), { async: false, breaks: true, gfm: true }) as string;

  const body = DOMPurify.sanitize(parsed, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // A question is a sentence, not a document, so anything that could reach outside the page
    // is refused outright rather than filtered.
    FORBID_TAGS: ["style", "script", "iframe", "object", "embed", "form", "input"],
    FORBID_ATTR: ["style", "onerror", "onload", "onclick"],
    RETURN_DOM: true,
  }) as HTMLElement;

  for (const image of Array.from(body.querySelectorAll("img"))) {
    const source = imageSource(image.getAttribute("src"), links);

    if (!source) {
      image.remove();
      continue;
    }

    const isEmote = image.getAttribute("title") === EMOTE_TITLE && isDiscordCdnUrl(source);

    image.setAttribute("src", source);
    image.setAttribute("loading", "lazy");
    image.setAttribute("referrerpolicy", "no-referrer");
    image.removeAttribute("title");
    image.setAttribute("class", isEmote ? "form-emote" : "form-text-image");
  }

  // Links open away from the form, so following one never costs somebody the answers they have
  // already typed.
  return body.innerHTML.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer nofollow" ');
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

  const named = text.replace(EMOTE_PATTERN, (_match, _animated: string, name: string) => `:${name}:`);

  return DOMPurify.sanitize(marked.parse(named, { async: false, gfm: true }) as string, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim();
}
