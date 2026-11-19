import { logger } from "$lib/logger";
import { databaseConfigured, databaseReady, ensureDatabase } from "$lib/server/db";
import { findByDashboardPath, searchWikiIndex, wikiSourceLocale } from "$lib/wiki";
import { entryToMeta, pickCatalogSource, resolveEntries, type Catalog, type CatalogSource, type ResolvedEntry } from "$lib/wiki/catalog";
import { renderWikiMarkdown } from "$lib/wiki/render";
import type { WikiArticle, WikiArticleMeta } from "$lib/wiki/types";
import { builtinCatalog } from "./builtin";
import { cacheGeneration, cachedCatalog, storeCatalog } from "./cache";
import { loadCatalog } from "./store";

export { invalidateWikiCache } from "./cache";

/** After a failed read the database is left alone for this long and the built-in files are served. */
const readRetryMs = 15_000;

let lastReadFailureAt = 0;
let lastLoggedFailureAt = 0;

/**
 * The one place that decides where wiki content comes from. The database is read when it is
 * configured and migrated, through a short cache that every write clears. When it is not
 * configured, is still starting, failed its migrations or fails a read, the built-in Markdown
 * files are served instead.
 */
export async function getCatalog(): Promise<{ catalog: Catalog; source: CatalogSource }> {
  const ready = databaseConfigured() ? await ensureDatabase() : false;
  const readFailed = Date.now() - lastReadFailureAt < readRetryMs;
  const source = pickCatalogSource({ configured: databaseConfigured(), ready: ready && databaseReady(), readFailed });
  if (source === "builtin") return { catalog: builtinCatalog().catalog, source };

  const cached = cachedCatalog();
  if (cached) return { catalog: cached, source };

  const generation = cacheGeneration();
  try {
    const catalog = await loadCatalog();
    storeCatalog(catalog, generation);
    return { catalog, source };
  } catch (error) {
    lastReadFailureAt = Date.now();
    if (Date.now() - lastLoggedFailureAt > readRetryMs) {
      lastLoggedFailureAt = Date.now();
      logger.error("Reading the wiki from the database failed, serving the built-in files:", error);
    }
    return { catalog: builtinCatalog().catalog, source: "builtin" };
  }
}

/** Whether wiki editing can work right now: the database is configured and migrated. */
export async function wikiDatabaseAvailable(): Promise<boolean> {
  if (!databaseConfigured()) return false;
  return (await ensureDatabase()) && databaseReady();
}

interface Resolved {
  source: CatalogSource;
  entries: ResolvedEntry[];
  bySlug: Map<string, ResolvedEntry>;
  byHref: Map<string, ResolvedEntry>;
}

const resolvedCache = new WeakMap<Catalog, Map<string, Resolved>>();

async function resolved(locale: string): Promise<Resolved> {
  const { catalog, source } = await getCatalog();
  let byLocale = resolvedCache.get(catalog);
  if (!byLocale) {
    byLocale = new Map();
    resolvedCache.set(catalog, byLocale);
  }
  let entry = byLocale.get(locale);
  if (!entry) {
    const entries = resolveEntries(catalog, locale);
    entry = {
      source,
      entries,
      bySlug: new Map(entries.map((e) => [e.page.slug, e])),
      byHref: new Map(entries.filter((e) => e.page.dashboardHref).map((e) => [e.page.dashboardHref!, e])),
    };
    byLocale.set(locale, entry);
  }
  return entry;
}

function toArticle(entry: ResolvedEntry): WikiArticle {
  const { html, headings } = renderWikiMarkdown(entry.version.markdown);
  return { ...entryToMeta(entry), markdown: entry.version.markdown, html, headings };
}

/**
 * Metadata for every readable article, in display order.
 *
 * @param locale The locale to serve; untranslated articles come in the source language.
 */
export async function getWikiIndex(locale: string = wikiSourceLocale): Promise<WikiArticleMeta[]> {
  return (await resolved(locale)).entries.map(entryToMeta);
}

/**
 * Finds an article by its slug.
 *
 * @param slug The `/wiki/<slug>` segment.
 * @param locale The locale to serve.
 * @returns The article with rendered HTML, or undefined when none exists.
 */
export async function getWikiArticle(slug: string, locale: string = wikiSourceLocale): Promise<WikiArticle | undefined> {
  const entry = (await resolved(locale)).bySlug.get(slug);
  return entry ? toArticle(entry) : undefined;
}

/**
 * The database id of a readable page and the locale its text is served in. The id is null when
 * the built-in files are being served, since those pages have no rows to attach edits to.
 *
 * @param slug The `/wiki/<slug>` segment.
 * @param locale The locale to serve.
 */
export async function getWikiPageRef(slug: string, locale: string = wikiSourceLocale): Promise<{ pageId: string | null; locale: string } | undefined> {
  const set = await resolved(locale);
  const entry = set.bySlug.get(slug);
  if (!entry) return undefined;
  return { pageId: set.source === "database" ? entry.page.id : null, locale: entry.locale };
}

/**
 * Finds the article documenting a dashboard page.
 *
 * @param pathname A dashboard path such as `/dashboard/afk` or `/dashboard/afk/anything`.
 * @param locale The locale to serve.
 * @returns The matching article, or undefined when the page has no write-up yet.
 */
export async function getWikiArticleForPath(pathname: string, locale: string = wikiSourceLocale): Promise<WikiArticle | undefined> {
  const entry = findByDashboardPath((await resolved(locale)).byHref, pathname);
  return entry ? toArticle(entry) : undefined;
}

/**
 * Filters articles by a free text query across title, summary, category, module and tags.
 *
 * @param query What the reader typed.
 * @param locale The locale to search.
 */
export async function searchWiki(query: string, locale: string = wikiSourceLocale): Promise<WikiArticleMeta[]> {
  return searchWikiIndex(await getWikiIndex(locale), query);
}

/** Slugs of every readable article, for the sitemap. */
export async function getWikiSlugs(): Promise<string[]> {
  return (await resolved(wikiSourceLocale)).entries.map((e) => e.page.slug);
}
