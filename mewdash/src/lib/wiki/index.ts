import { renderWikiMarkdown } from "./render";
import type { WikiArticle, WikiArticleMeta } from "./types";

export type { WikiArticle, WikiArticleMeta, WikiHeading } from "./types";

/**
 * Full class list for an article icon. Brand icons (Twitch, and so on) come through with their
 * own `fa-brands` prefix and have no duotone glyph, so they are used as written; everything else
 * renders in the dashboard's utility duotone style.
 *
 * @param icon The icon from the article frontmatter.
 * @returns Classes for an `<i>` element.
 */
export function wikiIconClass(icon: string): string {
  return icon.includes("fa-brands") ? icon : `fa-utility-duo fa-regular ${icon}`;
}

/** The locale every article exists in. Other locales fall back to it page by page. */
export const wikiSourceLocale = "en-US";

/**
 * Every article under `src/lib/content/wiki/<locale>/`, read at build time. Adding a Markdown
 * file to a locale folder is all it takes to publish a new page; nothing else needs registering.
 * A translation is the same file name under another locale folder, with the same `slug`.
 */
const sources = import.meta.glob("/src/lib/content/wiki/*/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

/** The locale folder a glob path sits in, such as `en-US` from `/src/lib/content/wiki/en-US/xp.md`. */
function localeOf(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 2];
}

function parseList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((s) => s.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

/**
 * Splits a file into its frontmatter and body. Frontmatter is a flat `key: value` block; lists
 * are written as `[a, b, c]`.
 */
function parseFrontmatter(raw: string): { fields: Record<string, string>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) return { fields: {}, body: raw };

  const fields: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    fields[key] = value;
  }
  return { fields, body: match[2] };
}

function buildArticle(path: string, raw: string): WikiArticle {
  const fileSlug = path.split("/").pop()!.replace(/\.md$/, "");
  const { fields, body } = parseFrontmatter(raw);
  const { html, headings } = renderWikiMarkdown(body);
  const words = body.split(/\s+/).filter(Boolean).length;

  return {
    slug: fields.slug || fileSlug,
    title: fields.title || fileSlug,
    summary: fields.summary || "",
    icon: fields.icon || "fa-book",
    category: fields.category || "General",
    dashboardHref: fields.dashboard || undefined,
    module: fields.module || undefined,
    tags: parseList(fields.tags),
    related: parseList(fields.related),
    readingMinutes: Math.max(1, Math.round(words / 200)),
    markdown: body,
    html,
    headings,
  };
}

/** Articles per locale, alphabetical by title within each. */
const articlesByLocale = new Map<string, WikiArticle[]>();
for (const [path, raw] of Object.entries(sources)) {
  const locale = localeOf(path);
  const list = articlesByLocale.get(locale) ?? [];
  list.push(buildArticle(path, raw));
  articlesByLocale.set(locale, list);
}
for (const list of articlesByLocale.values()) list.sort((a, b) => a.title.localeCompare(b.title));

const sourceArticles = articlesByLocale.get(wikiSourceLocale) ?? [];

/**
 * The article list served for a locale: every source article, each replaced by its translation
 * when one exists. Ordering follows the served titles.
 */
function resolveArticles(locale: string): WikiArticle[] {
  if (locale === wikiSourceLocale) return sourceArticles;
  const translated = articlesByLocale.get(locale);
  if (!translated) return sourceArticles;
  const bySlugTranslated = new Map(translated.map((a) => [a.slug, a]));
  return sourceArticles
    .map((a) => bySlugTranslated.get(a.slug) ?? a)
    .sort((a, b) => a.title.localeCompare(b.title));
}

const resolvedCache = new Map<string, { articles: WikiArticle[]; bySlug: Map<string, WikiArticle>; byHref: Map<string, WikiArticle> }>();

function resolved(locale: string) {
  let entry = resolvedCache.get(locale);
  if (!entry) {
    const articles = resolveArticles(locale);
    entry = {
      articles,
      bySlug: new Map(articles.map((a) => [a.slug, a])),
      byHref: new Map(articles.filter((a) => a.dashboardHref).map((a) => [a.dashboardHref!, a])),
    };
    resolvedCache.set(locale, entry);
  }
  return entry;
}

/** Locales that have at least one translated article. */
export function getWikiLocales(): string[] {
  return [...articlesByLocale.keys()].sort();
}

/** All articles, alphabetical by title. */
export function getWikiArticles(locale: string = wikiSourceLocale): WikiArticle[] {
  return resolved(locale).articles;
}

/** Metadata only, for index pages and search. */
export function getWikiIndex(locale: string = wikiSourceLocale): WikiArticleMeta[] {
  return getWikiArticles(locale).map(({ markdown: _m, html: _h, headings: _hd, ...meta }) => meta);
}

/**
 * Finds an article by its slug.
 *
 * @param slug The `/wiki/<slug>` segment.
 * @param locale The locale to serve; falls back to the source article when no translation exists.
 * @returns The article, or undefined when none exists.
 */
export function getWikiArticle(slug: string, locale: string = wikiSourceLocale): WikiArticle | undefined {
  return resolved(locale).bySlug.get(slug);
}

/**
 * Finds the article documenting a dashboard page.
 *
 * @param pathname A dashboard path such as `/dashboard/afk` or `/dashboard/afk/anything`.
 * @param locale The locale to serve.
 * @returns The matching article, or undefined when the page has no write-up yet.
 */
export function getWikiArticleForPath(pathname: string, locale: string = wikiSourceLocale): WikiArticle | undefined {
  const { byHref } = resolved(locale);
  const direct = byHref.get(pathname);
  if (direct) return direct;

  const segments = pathname.split("/").filter(Boolean);
  while (segments.length > 1) {
    segments.pop();
    const candidate = byHref.get("/" + segments.join("/"));
    if (candidate) return candidate;
  }
  return undefined;
}

/**
 * Filters articles by a free text query across title, summary, category and tags.
 */
export function searchWiki(query: string, locale: string = wikiSourceLocale): WikiArticleMeta[] {
  const q = query.trim().toLowerCase();
  const index = getWikiIndex(locale);
  if (!q) return index;
  const terms = q.split(/\s+/);
  return index.filter((a) => {
    const haystack = [a.title, a.summary, a.category, a.module ?? "", ...a.tags].join(" ").toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
}
