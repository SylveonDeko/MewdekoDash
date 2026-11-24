import { withTransaction } from "$lib/server/db";
import { isUniqueViolation, WikiError } from "$lib/server/wiki/errors";
import type { Actor } from "$lib/server/wiki/store";
import { canReviewLocale, type TranslationScope } from "$lib/translate/permissions";
import type { BulkItemResult, BulkResult, OverrideResult } from "$lib/translate/records";
import { cleanTranslation, translationLimits, translationProblem } from "$lib/translate/rules";
import { isBlocked } from "./contributors";
import { TranslationError } from "./errors";
import { clientRun } from "./run";
import { getSettings } from "./settings";
import {
  afterOverrideChange,
  bumpVersion,
  readCurrent,
  requireLocale,
  requireReviewer,
  writeOverrides,
  type OverrideWrite,
} from "./store";

interface StringState {
  source: string;
  current: string | null;
}

interface Accepted {
  index: number;
  key: string;
  text: string;
  source: string;
}

/**
 * Saves or suggests several strings of one language at once. Translators of the language and
 * admins save them straight away. Everyone else sends suggestions, each one checked against the
 * blocks, the open suggestion limit and the string's rules. A string that fails does not stop the
 * others, and the answer says what happened to each.
 *
 * @param catalog The catalog.
 * @param locale The language.
 * @param raw The submitted items, each with a key and a text.
 * @param actor The signed in person.
 * @param scope What the person may review.
 */
export async function saveMany(catalog: string, locale: string, raw: unknown, actor: Actor, scope: TranslationScope): Promise<BulkResult> {
  if (!Array.isArray(raw) || raw.length === 0) throw new TranslationError("bulk_empty", 400, "items");
  if (raw.length > translationLimits.bulkMax) throw new TranslationError("bulk_too_many", 400, "items");

  const direct = canReviewLocale(scope, locale);
  const items = raw.map((item) => {
    const record = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
    return { key: typeof record.key === "string" ? record.key : "", text: record.text };
  });

  const outcome = await withTransaction(async (client) => {
    const run = clientRun(client);
    await run("select pg_advisory_xact_lock(hashtext($1))", [`dash_tr_user:${actor.id}`]);
    await requireLocale(run, catalog, locale);

    if (!direct) {
      if (!(await getSettings(run)).suggestionsOpen) throw new TranslationError("suggestions_closed", 403);
      if (await isBlocked(actor.id, run)) throw new TranslationError("blocked", 403);
    }

    const keys = [...new Set(items.map((item) => item.key).filter((key) => key.length > 0 && key.length <= translationLimits.keyMax))];
    const found = await run<{ key: string; source_text: string; override_text: string | null; baseline_text: string | null }>(
      `select s.key, s.source_text, o.text as override_text, b.text as baseline_text
         from dash_tr_strings s
         left join dash_tr_overrides o on o.catalog = s.catalog and o.key = s.key and o.locale = $2
         left join dash_tr_baselines b on b.catalog = s.catalog and b.key = s.key and b.locale = $2
        where s.catalog = $1 and s.key = any($3::text[])
          for share of s`,
      [catalog, locale, keys],
    );
    const states = new Map<string, StringState>(
      found.rows.map((row) => [row.key, { source: row.source_text, current: row.override_text ?? row.baseline_text }]),
    );

    const errors: Array<string | null> = items.map(() => null);
    const accepted: Accepted[] = [];
    const seen = new Set<string>();
    items.forEach((item, index) => {
      if (seen.has(item.key)) {
        errors[index] = "duplicate";
        return;
      }
      seen.add(item.key);
      const state = states.get(item.key);
      if (!state) {
        errors[index] = "not_found";
        return;
      }
      const text = cleanTranslation(item.text);
      if (text === null) {
        errors[index] = "bad_request";
        return;
      }
      const problem = translationProblem(catalog, state.source, text, state.current);
      if (problem) {
        errors[index] = problem;
        return;
      }
      accepted.push({ index, key: item.key, text, source: state.source });
    });

    if (direct) {
      const writes: OverrideWrite[] = accepted.map((item) => ({ key: item.key, text: item.text, source: item.source }));
      if (writes.length > 0) {
        await writeOverrides(run, catalog, locale, writes, actor, "edit");
        await bumpVersion(run, catalog);
      }
      return { errors, changed: writes.length > 0 };
    }

    const settings = await getSettings(run);
    const open = await run<{ catalog: string; key: string; locale: string; text: string }>(
      "select catalog, key, locale, text from dash_tr_suggestions where user_id = $1 and status = 'open'",
      [actor.id],
    );
    let openCount = open.rows.length;
    const send: Accepted[] = [];
    for (const item of accepted) {
      const existing = open.rows.find((row) => row.catalog === catalog && row.locale === locale && row.key === item.key);
      if (existing?.text === item.text) {
        errors[item.index] = "already_suggested";
        continue;
      }
      if (!existing) {
        if (openCount >= settings.openSuggestionsMax) {
          errors[item.index] = "too_many_suggestions";
          continue;
        }
        openCount++;
      }
      send.push(item);
    }

    if (send.length > 0) {
      await run(
        `update dash_tr_suggestions set status = 'replaced', open_mark = null
          where catalog = $1 and locale = $2 and user_id = $3 and status = 'open' and key = any($4::text[])`,
        [catalog, locale, actor.id, send.map((item) => item.key)],
      );
      await run(
        `insert into dash_tr_suggestions (catalog, key, locale, text, source_text, user_id, user_name)
         select $1, x.key, $2, x.text, x.source, $3, $4 from unnest($5::text[], $6::text[], $7::text[]) as x(key, text, source)`,
        [catalog, locale, actor.id, actor.name, send.map((i) => i.key), send.map((i) => i.text), send.map((i) => i.source)],
      );
    }
    return { errors, changed: false };
  }).catch((error: unknown) => {
    if (isUniqueViolation(error)) throw new WikiError("conflict", 409);
    throw error;
  });

  if (outcome.changed) await afterOverrideChange(catalog);

  const results: BulkItemResult[] = items.map((item, index) => ({ key: item.key, saved: outcome.errors[index] === null, error: outcome.errors[index] }));
  const saved = results.filter((result) => result.saved).length;
  return { mode: direct ? "edit" : "suggest", results, saved, failed: results.length - saved };
}

/**
 * Brings back an earlier approved text of a string. The text is checked again against the string's
 * current English text, saved as the translation, and recorded in the history as a restore.
 *
 * @param catalog The catalog.
 * @param key The string's key.
 * @param locale The language.
 * @param suggestionId The approved history entry to bring back.
 * @param actor The translator or admin.
 * @param scope What the actor may review.
 */
export async function restoreTranslation(
  catalog: string,
  key: string,
  locale: string,
  suggestionId: string,
  actor: Actor,
  scope: TranslationScope,
): Promise<OverrideResult> {
  requireReviewer(scope, locale);
  const text = await withTransaction(async (client) => {
    const run = clientRun(client);
    await requireLocale(run, catalog, locale);
    const earlier = await run<{ text: string }>(
      "select text from dash_tr_suggestions where id = $1 and catalog = $2 and key = $3 and locale = $4 and status = 'approved'",
      [suggestionId, catalog, key, locale],
    );
    if (earlier.rows.length === 0) throw new TranslationError("history_not_restorable", 404);

    const state = await readCurrent(run, catalog, key, locale);
    const problem = translationProblem(catalog, state.source, earlier.rows[0].text, state.current);
    if (problem) throw new WikiError(problem, 400, "text");

    await writeOverrides(run, catalog, locale, [{ key, text: earlier.rows[0].text, source: state.source }], actor, "restore");
    await bumpVersion(run, catalog);
    return earlier.rows[0].text;
  });
  await afterOverrideChange(catalog);
  return { catalog, key, locale, text };
}
