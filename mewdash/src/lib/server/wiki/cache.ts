import type { Catalog } from "$lib/wiki/catalog";

const ttlMs = 30_000;

let cached: { catalog: Catalog; at: number } | null = null;
let generation = 0;

/** The database catalog if it was read recently and nothing has been written since. */
export function cachedCatalog(): Catalog | null {
  if (!cached || Date.now() - cached.at > ttlMs) return null;
  return cached.catalog;
}

/** A token to pass back to {@link storeCatalog}, taken before the read starts. */
export function cacheGeneration(): number {
  return generation;
}

/**
 * Keeps a catalog, unless a write happened while it was being read.
 *
 * @param catalog The catalog that was read.
 * @param startedAt The token from {@link cacheGeneration} taken before the read.
 */
export function storeCatalog(catalog: Catalog, startedAt: number): void {
  if (startedAt === generation) cached = { catalog, at: Date.now() };
}

/** Drops the cache. Every write to the wiki calls this after it commits. */
export function invalidateWikiCache(): void {
  generation++;
  cached = null;
}
