import { catalogFromSeed, type Catalog } from "$lib/wiki/catalog";
import { mapFrontmatter, type SeedEntry } from "$lib/wiki/frontmatter";

/**
 * Every Markdown file under `src/lib/content/wiki/<locale>/`, bundled at build time. After the
 * first start with a database these are only the offline fallback and the one-time seed.
 */
const sources = import.meta.glob("/src/lib/content/wiki/*/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

let seedEntries: SeedEntry[] | null = null;
let builtinCache: { catalog: Catalog; skipped: SeedEntry[] } | null = null;

/** Every built-in file mapped to the stored fields. */
export function builtinSeedEntries(): SeedEntry[] {
  seedEntries ??= Object.entries(sources).map(([path, raw]) => mapFrontmatter(path, raw));
  return seedEntries;
}

/** The built-in files as a catalog, in the order the wiki has always listed them. */
export function builtinCatalog(): { catalog: Catalog; skipped: SeedEntry[] } {
  builtinCache ??= catalogFromSeed(builtinSeedEntries());
  return builtinCache;
}
