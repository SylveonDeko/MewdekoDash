import type { OverlayCatalog } from "./records";
import { structureProblem } from "./rules";

export interface OverrideRow {
  key: string;
  locale: string;
  text: string;
  sourceText: string;
}

/**
 * Splits a dashboard string key `<module>.<key>` at its first dot.
 *
 * @param fullKey The key as stored in the database.
 * @returns The module and key, or null when the key has no module.
 */
export function splitDashKey(fullKey: string): { module: string; key: string } | null {
  const dot = fullKey.indexOf(".");
  if (dot <= 0 || dot === fullKey.length - 1) return null;
  return { module: fullKey.slice(0, dot), key: fullKey.slice(dot + 1) };
}

/**
 * Groups dashboard overrides into one overlay per language. An override whose placeholders or
 * HTML tags no longer fit the string's current source text is left out, so the built-in text is
 * shown instead of a message that would print a raw placeholder or break markup.
 *
 * @param rows The overrides with the source text of their string as it is now.
 */
export function buildOverlays(rows: readonly OverrideRow[]): Map<string, OverlayCatalog> {
  const overlays = new Map<string, OverlayCatalog>();
  for (const row of rows) {
    const split = splitDashKey(row.key);
    if (!split) continue;
    if (structureProblem("dash", row.sourceText, row.text) !== null) continue;
    let overlay = overlays.get(row.locale);
    if (!overlay) {
      overlay = Object.create(null) as OverlayCatalog;
      overlays.set(row.locale, overlay);
    }
    const entries = overlay[split.module] ?? (overlay[split.module] = Object.create(null) as Record<string, string>);
    entries[split.key] = row.text;
  }
  return overlays;
}
