import { logger } from "$lib/logger";
import { databaseReady, query } from "$lib/server/db";
import { buildOverlays } from "$lib/translate/overlay";
import type { OverlayCatalog } from "$lib/translate/records";

const checkEveryMs = 60_000;

let overlays = new Map<string, OverlayCatalog>();
let loadedVersion: string | null = null;
let lastCheckAt = 0;
let running: Promise<void> | null = null;

async function load(force: boolean): Promise<void> {
  lastCheckAt = Date.now();
  try {
    const stored = await query<{ version: string }>("select version from dash_tr_catalogs where catalog = 'dash'");
    const version = stored.rows[0]?.version ?? null;
    if (!force && version === loadedVersion) return;
    const rows = await query<{ key: string; locale: string; text: string; source_text: string }>(
      `select o.key, o.locale, o.text, s.source_text
         from dash_tr_overrides o
         join dash_tr_strings s on s.catalog = o.catalog and s.key = o.key
        where o.catalog = 'dash'`,
    );
    overlays = buildOverlays(rows.rows.map((row) => ({ key: row.key, locale: row.locale, text: row.text, sourceText: row.source_text })));
    loadedVersion = version;
  } catch (error) {
    logger.warn("Reading the dashboard translations failed, keeping the ones in memory:", error);
  }
}

/**
 * Reloads the dashboard's approved translations from the database now. The dashboard calls this
 * after it writes one. A failure keeps what is in memory.
 */
export function refreshOverlay(): Promise<void> {
  const pending = (running ?? Promise.resolve()).then(() => load(true));
  const tracked = pending.finally(() => {
    if (running === tracked) running = null;
  });
  running = tracked;
  return tracked;
}

/**
 * Compares the stored `version` of the `dash` catalog with the one in memory and reloads when
 * they differ, at most once a minute. It never waits for the database on a request.
 */
export function refreshIfDue(): void {
  if (running || !databaseReady() || Date.now() - lastCheckAt < checkEveryMs) return;
  const pending = load(false).finally(() => {
    if (running === pending) running = null;
  });
  running = pending;
}

/**
 * The approved dashboard translations for a language, from memory. Returns null when there are
 * none, and starts a background check when one is due.
 *
 * @param locale The language being served.
 */
export function overlayFor(locale: string): OverlayCatalog | null {
  refreshIfDue();
  return overlays.get(locale) ?? null;
}

/** Forgets everything in memory. The integration tests use it between runs. */
export function resetOverlay(): void {
  overlays = new Map();
  loadedVersion = null;
  lastCheckAt = 0;
  running = null;
}
