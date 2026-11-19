import type { WikiArticleMeta } from "./types";

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
 * Filters article metadata by a free text query across title, summary, category, module and tags.
 *
 * @param index The articles to search.
 * @param query What the reader typed.
 */
export function searchWikiIndex(index: WikiArticleMeta[], query: string): WikiArticleMeta[] {
  const q = query.trim().toLowerCase();
  if (!q) return index;
  const terms = q.split(/\s+/);
  return index.filter((a) => {
    const haystack = [a.title, a.summary, a.category, a.module ?? "", ...a.tags].join(" ").toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
}

/**
 * Finds the entry documenting a dashboard page, walking up from the exact path to its parents.
 *
 * @param byHref Entries keyed by the dashboard path they document.
 * @param pathname A path such as `/dashboard/afk` or `/dashboard/afk/anything`.
 */
export function findByDashboardPath<T>(byHref: ReadonlyMap<string, T>, pathname: string): T | undefined {
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
