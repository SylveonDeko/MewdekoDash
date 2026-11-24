import { query } from "$lib/server/db";
import { defaultSettings, type WikiSettings } from "$lib/wiki/validation";

/** The wiki settings, with the default for every setting nobody has changed. */
export async function readSettings(): Promise<WikiSettings> {
  const result = await query<{ key: string; value: string }>("select key, value from dash_wiki_settings");
  const stored = new Map(result.rows.map((row) => [row.key, row.value]));
  return {
    suggestionsOpen: stored.has("suggestions_open") ? stored.get("suggestions_open") === "true" : defaultSettings.suggestionsOpen,
  };
}

/**
 * Saves the settings that are present in the patch.
 *
 * @param patch The settings to change.
 * @param userId The admin changing them.
 */
export async function writeSettings(patch: Partial<WikiSettings>, userId: string): Promise<void> {
  if (patch.suggestionsOpen !== undefined) {
    await query(
      `insert into dash_wiki_settings (key, value, updated_by) values ('suggestions_open', $1, $2)
       on conflict (key) do update set value = excluded.value, updated_at = now(), updated_by = excluded.updated_by`,
      [String(patch.suggestionsOpen), userId],
    );
  }
}
