import { createHash } from "node:crypto";

/** One string of a catalog as the bundled files describe it. */
export interface CatalogEntry {
  key: string;
  group: string;
  source: string;
  baselines: Record<string, string>;
}

function ordinal(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * The build hash of a catalog: sha256, in hex, over the JSON text of every key with its source
 * text and every language's built-in text, with keys and languages in ordinal order. The order
 * the entries arrive in does not change the result.
 *
 * @param entries The catalog's strings.
 */
export function catalogHash(entries: readonly CatalogEntry[]): string {
  const sorted = [...entries].sort((a, b) => ordinal(a.key, b.key));
  const body = sorted.map((entry) => [
    entry.key,
    entry.source,
    Object.entries(entry.baselines)
      .sort(([a], [b]) => ordinal(a, b))
      .map(([locale, text]) => [locale, text]),
  ]);
  return createHash("sha256").update(JSON.stringify(body)).digest("hex");
}
