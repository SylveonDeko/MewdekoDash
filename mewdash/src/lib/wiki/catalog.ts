import type { SeedEntry } from "./frontmatter.ts";
import type { WikiArticleMeta } from "./types.ts";

export const sourceLocale = "en-US";

export interface CatalogPage {
  id: string;
  slug: string;
  icon: string;
  category: string;
  dashboardHref: string | null;
  module: string | null;
  related: string[];
  sortOrder: number;
}

export interface CatalogVersion {
  title: string;
  summary: string;
  markdown: string;
  tags: string[];
}

/** Every readable page in display order, with each page's versions by locale. */
export interface Catalog {
  pages: CatalogPage[];
  versions: Map<string, Map<string, CatalogVersion>>;
}

export interface ResolvedEntry {
  page: CatalogPage;
  version: CatalogVersion;
  locale: string;
}

export type CatalogSource = "database" | "builtin";

/**
 * Chooses where the wiki is read from. The database is used only when it is configured, finished
 * its migrations and the last read from it succeeded; anything else serves the built-in files.
 */
export function pickCatalogSource(state: { configured: boolean; ready: boolean; readFailed: boolean }): CatalogSource {
  return state.configured && state.ready && !state.readFailed ? "database" : "builtin";
}

/**
 * Rough reading time.
 *
 * @param markdown The article body.
 */
export function readingMinutes(markdown: string): number {
  const words = markdown.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * The article list for a locale: every page, each with its translation when there is one and
 * the source language text otherwise. Pages with no text in either are left out.
 *
 * @param catalog The catalog to read.
 * @param locale The wanted locale.
 */
export function resolveEntries(catalog: Catalog, locale: string): ResolvedEntry[] {
  const entries: ResolvedEntry[] = [];
  for (const page of catalog.pages) {
    const byLocale = catalog.versions.get(page.slug);
    const translated = locale === sourceLocale ? undefined : byLocale?.get(locale);
    const version = translated ?? byLocale?.get(sourceLocale);
    if (!version) continue;
    entries.push({ page, version, locale: translated ? locale : sourceLocale });
  }
  return entries;
}

/**
 * Article metadata for an entry.
 *
 * @param entry A resolved entry.
 */
export function entryToMeta({ page, version }: ResolvedEntry): WikiArticleMeta {
  return {
    slug: page.slug,
    title: version.title,
    summary: version.summary,
    icon: page.icon,
    category: page.category,
    dashboardHref: page.dashboardHref ?? undefined,
    module: page.module ?? undefined,
    tags: version.tags,
    related: page.related,
    readingMinutes: readingMinutes(version.markdown),
  };
}

/**
 * Builds a catalog from the built-in files. Page details come from the source language file; a
 * file in another language only supplies that language's text. Pages are ordered alphabetically
 * by title, as the wiki has always listed them.
 *
 * @param entries Every built-in file, already mapped.
 * @returns The catalog and the files skipped because their slug has no source language file.
 */
export function catalogFromSeed(entries: SeedEntry[]): { catalog: Catalog; skipped: SeedEntry[] } {
  const sources = entries.filter((e) => e.locale === sourceLocale).sort((a, b) => a.title.localeCompare(b.title));
  const pages: CatalogPage[] = sources.map((e, index) => ({
    id: e.slug,
    slug: e.slug,
    icon: e.icon,
    category: e.category,
    dashboardHref: e.dashboardHref,
    module: e.module,
    related: e.related,
    sortOrder: index,
  }));

  const versions = new Map<string, Map<string, CatalogVersion>>();
  const known = new Set(pages.map((p) => p.slug));
  const skipped: SeedEntry[] = [];
  for (const e of entries) {
    if (!known.has(e.slug)) {
      skipped.push(e);
      continue;
    }
    const byLocale = versions.get(e.slug) ?? new Map<string, CatalogVersion>();
    byLocale.set(e.locale, { title: e.title, summary: e.summary, markdown: e.markdown, tags: e.tags });
    versions.set(e.slug, byLocale);
  }
  return { catalog: { pages, versions }, skipped };
}
