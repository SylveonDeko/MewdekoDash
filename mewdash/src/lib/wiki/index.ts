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

/**
 * Every article under `src/lib/content/wiki`, read at build time. Adding a Markdown file there
 * is all it takes to publish a new page; nothing else needs registering.
 */
const sources = import.meta.glob("/src/lib/content/wiki/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

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

const articles: WikiArticle[] = Object.entries(sources)
  .map(([path, raw]) => buildArticle(path, raw))
  .sort((a, b) => a.title.localeCompare(b.title));

const bySlug = new Map(articles.map((a) => [a.slug, a]));
const byHref = new Map(articles.filter((a) => a.dashboardHref).map((a) => [a.dashboardHref!, a]));

/** All articles, alphabetical by title. */
export function getWikiArticles(): WikiArticle[] {
  return articles;
}

/** Metadata only, for index pages and search. */
export function getWikiIndex(): WikiArticleMeta[] {
  return articles.map(({ markdown: _m, html: _h, headings: _hd, ...meta }) => meta);
}

/**
 * Finds an article by its slug.
 *
 * @param slug The `/wiki/<slug>` segment.
 * @returns The article, or undefined when none exists.
 */
export function getWikiArticle(slug: string): WikiArticle | undefined {
  return bySlug.get(slug);
}

/**
 * Finds the article documenting a dashboard page.
 *
 * @param pathname A dashboard path such as `/dashboard/afk` or `/dashboard/afk/anything`.
 * @returns The matching article, or undefined when the page has no write-up yet.
 */
export function getWikiArticleForPath(pathname: string): WikiArticle | undefined {
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
export function searchWiki(query: string): WikiArticleMeta[] {
  const q = query.trim().toLowerCase();
  const index = getWikiIndex();
  if (!q) return index;
  const terms = q.split(/\s+/);
  return index.filter((a) => {
    const haystack = [a.title, a.summary, a.category, a.module ?? "", ...a.tags].join(" ").toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
}

/** Distinct categories in display order, following the dashboard's ordering. */
export const wikiCategoryOrder = ["Community", "Entertainment", "Actions", "Security", "Analytics", "Settings", "General"];

export function getWikiCategories(): { category: string; articles: WikiArticleMeta[] }[] {
  const index = getWikiIndex();
  const groups = new Map<string, WikiArticleMeta[]>();
  for (const a of index) {
    if (!groups.has(a.category)) groups.set(a.category, []);
    groups.get(a.category)!.push(a);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => {
      const ia = wikiCategoryOrder.indexOf(a);
      const ib = wikiCategoryOrder.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    })
    .map(([category, list]) => ({ category, articles: list }));
}
