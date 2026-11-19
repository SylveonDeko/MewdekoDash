import { translationSourceLocale } from "$lib/translate/rules";
import type { CatalogEntry } from "./hash";

type ModuleFile = Record<string, unknown>;

const files = import.meta.glob<ModuleFile>("../../i18n/*/*.json", { import: "default" });

/**
 * Reads the dashboard's bundled catalogs, `src/lib/i18n/<locale>/<module>.json`, as catalog
 * entries. Keys are `<module>.<key>`, the module is the group, and every other language's text
 * for a key the source language has is its built-in translation.
 */
export async function readDashCatalog(): Promise<CatalogEntry[]> {
  const loaded = await Promise.all(
    Object.entries(files).map(async ([path, load]) => {
      const parts = path.split("/");
      const locale = parts[parts.length - 2];
      const module = parts[parts.length - 1].replace(/\.json$/, "");
      return { locale, module, entries: await load() };
    }),
  );

  const byKey = new Map<string, CatalogEntry>();
  for (const file of loaded) {
    if (file.locale !== translationSourceLocale) continue;
    for (const [key, text] of Object.entries(file.entries)) {
      if (typeof text !== "string") continue;
      const full = `${file.module}.${key}`;
      byKey.set(full, { key: full, group: file.module, source: text, baselines: {} });
    }
  }
  for (const file of loaded) {
    if (file.locale === translationSourceLocale) continue;
    for (const [key, text] of Object.entries(file.entries)) {
      if (typeof text !== "string") continue;
      const entry = byKey.get(`${file.module}.${key}`);
      if (entry) entry.baselines[file.locale] = text;
    }
  }
  return [...byKey.values()];
}
