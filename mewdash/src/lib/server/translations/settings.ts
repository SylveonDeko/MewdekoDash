import { query } from "$lib/server/db";
import { WikiError } from "$lib/server/wiki/errors";
import type { TranslationSettings } from "$lib/translate/records";
import { translationLimits } from "$lib/translate/rules";
import { poolRun, type Run } from "./run";

/**
 * The settings of the translation tool. A database with no settings row gets the defaults.
 *
 * @param run Where to run the query.
 */
export async function getSettings(run: Run = poolRun): Promise<TranslationSettings> {
  const result = await run<{ suggestions_open: boolean; open_suggestions_max: number }>(
    "select suggestions_open, open_suggestions_max from dash_tr_settings where id = 1",
  );
  const row = result.rows[0];
  return {
    suggestionsOpen: row?.suggestions_open ?? true,
    openSuggestionsMax: row?.open_suggestions_max ?? translationLimits.openSuggestionsMax,
  };
}

/**
 * Changes the settings. Only the fields that are present change.
 *
 * @param input The submitted fields.
 * @param actorId The admin saving them.
 */
export async function saveSettings(input: { suggestionsOpen?: unknown; openSuggestionsMax?: unknown }, actorId: string): Promise<TranslationSettings> {
  const current = await getSettings();
  let suggestionsOpen = current.suggestionsOpen;
  let openSuggestionsMax = current.openSuggestionsMax;

  if (input.suggestionsOpen !== undefined) {
    if (typeof input.suggestionsOpen !== "boolean") throw new WikiError("bad_request", 400, "suggestionsOpen");
    suggestionsOpen = input.suggestionsOpen;
  }
  if (input.openSuggestionsMax !== undefined) {
    const max = input.openSuggestionsMax;
    if (typeof max !== "number" || !Number.isInteger(max) || max < 1 || max > translationLimits.openSuggestionsCap) {
      throw new WikiError("bad_request", 400, "openSuggestionsMax");
    }
    openSuggestionsMax = max;
  }

  await query(
    `insert into dash_tr_settings (id, suggestions_open, open_suggestions_max, updated_by) values (1, $1, $2, $3)
     on conflict (id) do update
       set suggestions_open = excluded.suggestions_open, open_suggestions_max = excluded.open_suggestions_max,
           updated_at = now(), updated_by = excluded.updated_by`,
    [suggestionsOpen, openSuggestionsMax, actorId],
  );
  return { suggestionsOpen, openSuggestionsMax };
}
