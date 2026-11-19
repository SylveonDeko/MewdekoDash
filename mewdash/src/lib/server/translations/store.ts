import type pg from "pg";
import { query, withTransaction } from "$lib/server/db";
import { isUniqueViolation, WikiError } from "$lib/server/wiki/errors";
import { knownName, type Actor } from "$lib/server/wiki/store";
import { canReviewLocale, canViewHistoryEntry, type TranslationScope } from "$lib/translate/permissions";
import type {
  CatalogOverview,
  HistoryEntry,
  LanguageProgress,
  OverrideResult,
  StringPage,
  StringQuery,
  StringRow,
  SuggestionPage,
  SuggestionRecord,
  TranslationStatus,
  TranslatorRecord,
} from "$lib/translate/records";
import { cleanTranslation, escapeLike, structureProblem, translationLimits, translationProblem, translationSourceLocale } from "$lib/translate/rules";
import { refreshOverlay } from "./overlay";
import { notifyReload } from "./reload";

type Run = <T extends pg.QueryResultRow>(text: string, params?: unknown[]) => Promise<pg.QueryResult<T>>;

const poolRun: Run = <T extends pg.QueryResultRow>(text: string, params: unknown[] = []) => query<T>(text, params);
const clientRun =
  (client: pg.PoolClient): Run =>
  <T extends pg.QueryResultRow>(text: string, params: unknown[] = []) =>
    client.query<T>(text, params);

const iso = (value: Date): string => value.toISOString();
const isoOrNull = (value: Date | null): string | null => (value ? value.toISOString() : null);

/** The languages a catalog can be translated into: every language any catalog has, so a catalog with no built-in translations can still be started. */
export async function catalogLocales(_catalog: string, run: Run = poolRun): Promise<string[]> {
  return allLocales(run);
}

/** Every language of every catalog, apart from the source language. */
export async function allLocales(run: Run = poolRun): Promise<string[]> {
  const result = await run<{ locale: string }>(
    `select locale from dash_tr_baselines union select locale from dash_tr_overrides order by locale`,
  );
  return result.rows.map((row) => row.locale).filter((locale) => locale !== translationSourceLocale);
}

async function requireLocale(run: Run, catalog: string, locale: string): Promise<void> {
  if (locale === translationSourceLocale) throw new WikiError("locale_invalid", 400, "locale");
  if (!(await catalogLocales(catalog, run)).includes(locale)) throw new WikiError("locale_invalid", 400, "locale");
}

async function requireCatalog(run: Run, catalog: string): Promise<void> {
  const found = await run("select 1 from dash_tr_catalogs where catalog = $1", [catalog]);
  if ((found.rowCount ?? 0) === 0) throw new WikiError("not_found", 404);
}

/** Every registered catalog with its groups and, per language, how much is translated. */
export async function getOverview(): Promise<CatalogOverview[]> {
  const catalogs = await query<{ catalog: string }>("select catalog from dash_tr_catalogs order by catalog");
  return Promise.all(
    catalogs.rows.map(async ({ catalog }) => {
      const [locales, groups, totals] = await Promise.all([
        catalogLocales(catalog),
        query<{ grp: string }>("select distinct grp from dash_tr_strings where catalog = $1 order by grp", [catalog]),
        query<{ total: string }>("select count(*) as total from dash_tr_strings where catalog = $1", [catalog]),
      ]);
      const progress = await query<{ locale: string; untranslated: string; outdated: string }>(
        `select l.locale,
                count(*) filter (where o.key is null and (b.key is null or b.text = s.source_text)) as untranslated,
                count(*) filter (where o.key is not null and o.source_text <> s.source_text) as outdated
           from dash_tr_strings s
          cross join unnest($2::text[]) as l(locale)
           left join dash_tr_baselines b on b.catalog = s.catalog and b.key = s.key and b.locale = l.locale
           left join dash_tr_overrides o on o.catalog = s.catalog and o.key = s.key and o.locale = l.locale
          where s.catalog = $1
          group by l.locale`,
        [catalog, locales],
      );
      const open = await query<{ locale: string; open: string }>(
        `select x.locale, count(*) as open
           from dash_tr_suggestions x
           join dash_tr_strings s on s.catalog = x.catalog and s.key = x.key
          where x.catalog = $1 and x.status = 'open'
          group by x.locale`,
        [catalog],
      );
      const total = Number(totals.rows[0]?.total ?? 0);
      const progressBy = new Map(progress.rows.map((row) => [row.locale, row]));
      const openBy = new Map(open.rows.map((row) => [row.locale, Number(row.open)]));
      const languages: LanguageProgress[] = locales.map((locale) => ({
        locale,
        total,
        untranslated: Number(progressBy.get(locale)?.untranslated ?? total),
        outdated: Number(progressBy.get(locale)?.outdated ?? 0),
        openSuggestions: openBy.get(locale) ?? 0,
      }));
      return { catalog, total, groups: groups.rows.map((row) => row.grp), languages };
    }),
  );
}

interface StringDbRow {
  key: string;
  grp: string;
  source_text: string;
  baseline_text: string | null;
  override_text: string | null;
  override_source: string | null;
  override_updated_at: Date | null;
  override_updated_by_name: string | null;
  open_suggestions: string;
  mine_id: string | null;
  mine_text: string | null;
}

function toStringRow(row: StringDbRow): StringRow {
  const hasOverride = row.override_text !== null;
  const outdated = hasOverride && row.override_source !== row.source_text;
  return {
    key: row.key,
    group: row.grp,
    source: row.source_text,
    translation: row.override_text ?? row.baseline_text,
    hasOverride,
    untranslated: !hasOverride && (row.baseline_text === null || row.baseline_text === row.source_text),
    outdated,
    previousSource: outdated ? row.override_source : null,
    openSuggestions: Number(row.open_suggestions),
    mine: row.mine_id !== null && row.mine_text !== null ? { id: row.mine_id, text: row.mine_text } : null,
    updatedByName: row.override_updated_by_name,
    updatedAt: isoOrNull(row.override_updated_at),
  };
}

/**
 * One page of a catalog's strings for a language, 50 at a time, ordered by group and key. The
 * search matches the key, the source text and the current translation, ignoring case.
 *
 * @param input Which catalog, language, group, filter, search term and page.
 * @param viewerId The signed in person, whose own open suggestions are attached to the rows.
 */
export async function listStrings(input: StringQuery, viewerId: string | null): Promise<StringPage> {
  await requireCatalog(poolRun, input.catalog);
  await requireLocale(poolRun, input.catalog, input.locale);

  const params: unknown[] = [input.catalog, input.locale];
  const where = ["s.catalog = $1"];
  if (input.group !== null) {
    params.push(input.group);
    where.push(`s.grp = $${params.length}`);
  }
  const term = input.search.trim().slice(0, translationLimits.searchMax);
  if (term) {
    params.push(`%${escapeLike(term)}%`);
    const p = `$${params.length}`;
    where.push(
      `(s.key ilike ${p} escape '\\' or s.source_text ilike ${p} escape '\\' or coalesce(o.text, b.text, '') ilike ${p} escape '\\')`,
    );
  }
  if (input.filter === "untranslated") where.push("(o.key is null and (b.key is null or b.text = s.source_text))");
  if (input.filter === "outdated") where.push("(o.key is not null and o.source_text <> s.source_text)");
  if (input.filter === "suggestions") {
    where.push(
      "exists (select 1 from dash_tr_suggestions q where q.catalog = s.catalog and q.key = s.key and q.locale = $2 and q.status = 'open')",
    );
  }

  const from = `from dash_tr_strings s
    left join dash_tr_baselines b on b.catalog = s.catalog and b.key = s.key and b.locale = $2
    left join dash_tr_overrides o on o.catalog = s.catalog and o.key = s.key and o.locale = $2`;
  const condition = where.join(" and ");

  const page = Math.max(1, Math.floor(input.page));
  const total = await query<{ total: string }>(`select count(*) as total ${from} where ${condition}`, params);

  const rowParams = [...params, viewerId, translationLimits.pageSize, (page - 1) * translationLimits.pageSize];
  const viewer = `$${params.length + 1}`;
  const limit = `$${params.length + 2}`;
  const offset = `$${params.length + 3}`;
  const rows = await query<StringDbRow>(
    `select s.key, s.grp, s.source_text, b.text as baseline_text, o.text as override_text, o.source_text as override_source,
            o.updated_at as override_updated_at, o.updated_by_name as override_updated_by_name,
            (select count(*) from dash_tr_suggestions q where q.catalog = s.catalog and q.key = s.key and q.locale = $2 and q.status = 'open') as open_suggestions,
            mine.id as mine_id, mine.text as mine_text
       ${from}
       left join dash_tr_suggestions mine on mine.catalog = s.catalog and mine.key = s.key and mine.locale = $2
                                         and mine.user_id = ${viewer}::text and mine.status = 'open'
      where ${condition}
      order by s.grp, s.key
      limit ${limit} offset ${offset}`,
    rowParams,
  );

  return { rows: rows.rows.map(toStringRow), total: Number(total.rows[0].total), page, pageSize: translationLimits.pageSize };
}

interface HistoryDbRow {
  id: string;
  text: string;
  source_text: string;
  user_id: string;
  user_name: string;
  status: TranslationStatus;
  decline_reason: string;
  created_at: Date;
  reviewed_at: Date | null;
  reviewed_by_name: string | null;
}

/**
 * Every suggestion and direct edit of one string in one language, newest first. Approved text is
 * shown to everyone, the rest to its author and to reviewers of the language.
 *
 * @param catalog The catalog.
 * @param key The string's key.
 * @param locale The language.
 * @param viewerId The signed in person, if any.
 * @param scope What the viewer may review.
 */
export async function getHistory(catalog: string, key: string, locale: string, viewerId: string | null, scope: TranslationScope): Promise<HistoryEntry[]> {
  const exists = await query("select 1 from dash_tr_strings where catalog = $1 and key = $2", [catalog, key]);
  if ((exists.rowCount ?? 0) === 0) throw new WikiError("not_found", 404);
  await requireLocale(poolRun, catalog, locale);

  const result = await query<HistoryDbRow>(
    `select id, text, source_text, user_id, user_name, status, decline_reason, created_at, reviewed_at, reviewed_by_name
       from dash_tr_suggestions
      where catalog = $1 and key = $2 and locale = $3
      order by id desc limit 200`,
    [catalog, key, locale],
  );
  return result.rows
    .filter((row) => canViewHistoryEntry(scope, viewerId, { status: row.status, locale, userId: row.user_id }))
    .map((row) => ({
      id: row.id,
      text: row.text,
      sourceText: row.source_text,
      userId: row.user_id,
      userName: row.user_name,
      status: row.status,
      declineReason: row.decline_reason,
      createdAt: iso(row.created_at),
      reviewedAt: isoOrNull(row.reviewed_at),
      reviewedByName: row.reviewed_by_name,
    }));
}

interface CurrentState {
  source: string;
  current: string | null;
}

async function readCurrent(run: Run, catalog: string, key: string, locale: string): Promise<CurrentState> {
  const result = await run<{ source_text: string; override_text: string | null; baseline_text: string | null }>(
    `select s.source_text, o.text as override_text, b.text as baseline_text
       from dash_tr_strings s
       left join dash_tr_overrides o on o.catalog = s.catalog and o.key = s.key and o.locale = $3
       left join dash_tr_baselines b on b.catalog = s.catalog and b.key = s.key and b.locale = $3
      where s.catalog = $1 and s.key = $2
        for share of s`,
    [catalog, key, locale],
  );
  const row = result.rows[0];
  if (!row) throw new WikiError("not_found", 404);
  return { source: row.source_text, current: row.override_text ?? row.baseline_text };
}

function checkedText(catalog: string, state: CurrentState, raw: unknown): string {
  const text = cleanTranslation(raw);
  if (text === null) throw new WikiError("bad_request", 400, "text");
  const problem = translationProblem(catalog, state.source, text, state.current);
  if (problem) throw new WikiError(problem, 400, "text");
  return text;
}

/**
 * Stores a member's suggestion for a string in a language. The member's earlier open suggestion
 * for the same string and language is marked as replaced. A member can have 200 open suggestions.
 *
 * @param catalog The catalog.
 * @param key The string's key.
 * @param locale The language of the text.
 * @param raw The suggested text.
 * @param actor The member.
 * @returns The new suggestion's id.
 */
export async function submitSuggestion(catalog: string, key: string, locale: string, raw: unknown, actor: Actor): Promise<string> {
  try {
    return await withTransaction(async (client) => {
      const run = clientRun(client);
      await run("select pg_advisory_xact_lock(hashtext($1))", [`dash_tr_user:${actor.id}`]);
      await requireLocale(run, catalog, locale);
      const state = await readCurrent(run, catalog, key, locale);
      const text = checkedText(catalog, state, raw);

      const others = await run<{ n: string }>(
        `select count(*) as n from dash_tr_suggestions
          where user_id = $1 and status = 'open' and not (catalog = $2 and key = $3 and locale = $4)`,
        [actor.id, catalog, key, locale],
      );
      if (Number(others.rows[0].n) >= translationLimits.openSuggestionsMax) throw new WikiError("too_many_suggestions", 409);

      await run(
        `update dash_tr_suggestions set status = 'replaced', open_mark = null
          where catalog = $1 and key = $2 and locale = $3 and user_id = $4 and status = 'open'`,
        [catalog, key, locale, actor.id],
      );
      const inserted = await run<{ id: string }>(
        `insert into dash_tr_suggestions (catalog, key, locale, text, source_text, user_id, user_name)
         values ($1, $2, $3, $4, $5, $6, $7) returning id`,
        [catalog, key, locale, text, state.source, actor.id, actor.name],
      );
      return inserted.rows[0].id;
    });
  } catch (error) {
    if (isUniqueViolation(error)) throw new WikiError("conflict", 409);
    throw error;
  }
}

interface SuggestionDbRow {
  id: string;
  catalog: string;
  key: string;
  locale: string;
  text: string;
  source_text: string;
  user_id: string;
  user_name: string;
  status: TranslationStatus;
  decline_reason: string;
  created_at: Date;
  reviewed_at: Date | null;
  reviewed_by_name: string | null;
  grp: string | null;
  current_source: string | null;
  override_text: string | null;
  baseline_text: string | null;
}

const suggestionSelect = `
  select x.id, x.catalog, x.key, x.locale, x.text, x.source_text, x.user_id, x.user_name, x.status, x.decline_reason,
         x.created_at, x.reviewed_at, x.reviewed_by_name,
         s.grp, s.source_text as current_source, o.text as override_text, b.text as baseline_text
    from dash_tr_suggestions x
    left join dash_tr_strings s on s.catalog = x.catalog and s.key = x.key
    left join dash_tr_overrides o on o.catalog = x.catalog and o.key = x.key and o.locale = x.locale
    left join dash_tr_baselines b on b.catalog = x.catalog and b.key = x.key and b.locale = x.locale`;

function toSuggestion(row: SuggestionDbRow): SuggestionRecord {
  return {
    id: row.id,
    catalog: row.catalog,
    key: row.key,
    group: row.grp ?? "",
    locale: row.locale,
    text: row.text,
    sourceText: row.source_text,
    currentSource: row.current_source,
    currentText: row.override_text ?? row.baseline_text,
    userId: row.user_id,
    userName: row.user_name,
    status: row.status,
    declineReason: row.decline_reason,
    createdAt: iso(row.created_at),
    reviewedAt: isoOrNull(row.reviewed_at),
    reviewedByName: row.reviewed_by_name,
  };
}

/**
 * A member's own suggestions, newest first, 50 at a time.
 *
 * @param userId The member.
 * @param page The page, starting at 1.
 */
export async function listMySuggestions(userId: string, page: number): Promise<SuggestionPage> {
  const at = Math.max(1, Math.floor(page));
  const total = await query<{ n: string }>("select count(*) as n from dash_tr_suggestions where user_id = $1", [userId]);
  const rows = await query<SuggestionDbRow>(
    `${suggestionSelect} where x.user_id = $1 order by x.id desc limit $2 offset $3`,
    [userId, translationLimits.pageSize, (at - 1) * translationLimits.pageSize],
  );
  return { rows: rows.rows.map(toSuggestion), total: Number(total.rows[0].n), page: at, pageSize: translationLimits.pageSize };
}

/**
 * Open suggestions waiting for review, oldest first, 50 at a time. Only languages the viewer may
 * review are included, and strings that no longer exist are left out.
 *
 * @param scope What the viewer may review.
 * @param filter Optional catalog and language to narrow to.
 * @param page The page, starting at 1.
 */
export async function listQueue(
  scope: TranslationScope,
  filter: { catalog: string | null; locale: string | null },
  page: number,
): Promise<SuggestionPage> {
  const at = Math.max(1, Math.floor(page));
  const allowed = scope.admin ? null : [...scope.locales];
  if (allowed !== null && allowed.length === 0) return { rows: [], total: 0, page: at, pageSize: translationLimits.pageSize };

  const params = [allowed, filter.catalog, filter.locale];
  const condition = `x.status = 'open' and s.key is not null
      and ($1::text[] is null or x.locale = any($1::text[]))
      and ($2::text is null or x.catalog = $2) and ($3::text is null or x.locale = $3)`;
  const total = await query<{ n: string }>(
    `select count(*) as n from dash_tr_suggestions x
       join dash_tr_strings s on s.catalog = x.catalog and s.key = x.key
      where ${condition}`,
    params,
  );
  const rows = await query<SuggestionDbRow>(
    `${suggestionSelect} where ${condition} order by x.created_at, x.id limit $4 offset $5`,
    [...params, translationLimits.pageSize, (at - 1) * translationLimits.pageSize],
  );
  return { rows: rows.rows.map(toSuggestion), total: Number(total.rows[0].n), page: at, pageSize: translationLimits.pageSize };
}

async function bumpVersion(run: Run, catalog: string): Promise<void> {
  await run("update dash_tr_catalogs set version = version + 1 where catalog = $1", [catalog]);
}

async function afterOverrideChange(catalog: string): Promise<void> {
  if (catalog === "dash") await refreshOverlay();
  await notifyReload(catalog);
}

function requireReviewer(scope: TranslationScope, locale: string): void {
  if (!canReviewLocale(scope, locale)) throw new WikiError("forbidden", 403);
}

/**
 * Saves a translation straight away. It is stored as an approved suggestion by the reviewer so
 * the string has a history, the reviewer's own open suggestion for the string is marked as
 * replaced, and the catalog's version goes up.
 *
 * @param catalog The catalog.
 * @param key The string's key.
 * @param locale The language.
 * @param raw The text.
 * @param actor The translator or admin.
 * @param scope What the actor may review.
 */
export async function saveOverride(catalog: string, key: string, locale: string, raw: unknown, actor: Actor, scope: TranslationScope): Promise<OverrideResult> {
  requireReviewer(scope, locale);
  const text = await withTransaction(async (client) => {
    const run = clientRun(client);
    await requireLocale(run, catalog, locale);
    const state = await readCurrent(run, catalog, key, locale);
    const clean = checkedText(catalog, state, raw);

    await run(
      `insert into dash_tr_overrides (catalog, key, locale, text, source_text, updated_by, updated_by_name)
       values ($1, $2, $3, $4, $5, $6, $7)
       on conflict (catalog, key, locale) do update
         set text = excluded.text, source_text = excluded.source_text, updated_at = now(),
             updated_by = excluded.updated_by, updated_by_name = excluded.updated_by_name`,
      [catalog, key, locale, clean, state.source, actor.id, actor.name],
    );
    await run(
      `update dash_tr_suggestions set status = 'replaced', open_mark = null
        where catalog = $1 and key = $2 and locale = $3 and user_id = $4 and status = 'open'`,
      [catalog, key, locale, actor.id],
    );
    await run(
      `insert into dash_tr_suggestions (catalog, key, locale, text, source_text, user_id, user_name, status, open_mark, reviewed_at, reviewed_by, reviewed_by_name)
       values ($1, $2, $3, $4, $5, $6, $7, 'approved', null, now(), $6, $7)`,
      [catalog, key, locale, clean, state.source, actor.id, actor.name],
    );
    await bumpVersion(run, catalog);
    return clean;
  });
  await afterOverrideChange(catalog);
  return { catalog, key, locale, text };
}

/**
 * Approves an open suggestion: its text becomes the override for the string and language, and
 * the catalog's version goes up when that changes anything. The text is checked again against
 * the string's current source text.
 *
 * @param suggestionId The suggestion.
 * @param reviewer The translator or admin approving it.
 * @param scope What the reviewer may review.
 */
export async function approveSuggestion(suggestionId: string, reviewer: Actor, scope: TranslationScope): Promise<OverrideResult> {
  const result = await withTransaction(async (client) => {
    const run = clientRun(client);
    const found = await run<{ catalog: string; key: string; locale: string; text: string; source_text: string; status: TranslationStatus }>(
      "select catalog, key, locale, text, source_text, status from dash_tr_suggestions where id = $1 for update",
      [suggestionId],
    );
    const suggestion = found.rows[0];
    if (!suggestion) throw new WikiError("not_found", 404);
    requireReviewer(scope, suggestion.locale);
    if (suggestion.status !== "open") throw new WikiError("conflict", 409);

    const state = await readCurrent(run, suggestion.catalog, suggestion.key, suggestion.locale);
    const problem = structureProblem(suggestion.catalog, state.source, suggestion.text);
    if (problem) throw new WikiError(problem, 400, "text");

    const existing = await run<{ text: string; source_text: string }>(
      "select text, source_text from dash_tr_overrides where catalog = $1 and key = $2 and locale = $3 for update",
      [suggestion.catalog, suggestion.key, suggestion.locale],
    );
    const same = existing.rows[0]?.text === suggestion.text && existing.rows[0]?.source_text === suggestion.source_text;
    if (!same) {
      await run(
        `insert into dash_tr_overrides (catalog, key, locale, text, source_text, updated_by, updated_by_name)
         values ($1, $2, $3, $4, $5, $6, $7)
         on conflict (catalog, key, locale) do update
           set text = excluded.text, source_text = excluded.source_text, updated_at = now(),
               updated_by = excluded.updated_by, updated_by_name = excluded.updated_by_name`,
        [suggestion.catalog, suggestion.key, suggestion.locale, suggestion.text, suggestion.source_text, reviewer.id, reviewer.name],
      );
      await bumpVersion(run, suggestion.catalog);
    }
    await run(
      `update dash_tr_suggestions set status = 'approved', open_mark = null, reviewed_at = now(), reviewed_by = $2, reviewed_by_name = $3
        where id = $1`,
      [suggestionId, reviewer.id, reviewer.name],
    );
    return { catalog: suggestion.catalog, key: suggestion.key, locale: suggestion.locale, text: suggestion.text, changed: !same };
  });
  if (result.changed) await afterOverrideChange(result.catalog);
  return { catalog: result.catalog, key: result.key, locale: result.locale, text: result.text };
}

/**
 * Declines an open suggestion with an optional reason.
 *
 * @param suggestionId The suggestion.
 * @param reviewer The translator or admin declining it.
 * @param scope What the reviewer may review.
 * @param reason Why, or an empty string.
 */
export async function declineSuggestion(suggestionId: string, reviewer: Actor, scope: TranslationScope, reason: string): Promise<void> {
  await withTransaction(async (client) => {
    const run = clientRun(client);
    const found = await run<{ locale: string; status: TranslationStatus }>(
      "select locale, status from dash_tr_suggestions where id = $1 for update",
      [suggestionId],
    );
    const suggestion = found.rows[0];
    if (!suggestion) throw new WikiError("not_found", 404);
    requireReviewer(scope, suggestion.locale);
    if (suggestion.status !== "open") throw new WikiError("conflict", 409);
    await run(
      `update dash_tr_suggestions
          set status = 'declined', open_mark = null, decline_reason = $2, reviewed_at = now(), reviewed_by = $3, reviewed_by_name = $4
        where id = $1`,
      [suggestionId, reason, reviewer.id, reviewer.name],
    );
  });
}

/**
 * Removes an override so the built-in translation shows again. The catalog's version goes up.
 *
 * @param catalog The catalog.
 * @param key The string's key.
 * @param locale The language.
 * @param scope What the person may review.
 */
export async function revertOverride(catalog: string, key: string, locale: string, scope: TranslationScope): Promise<OverrideResult> {
  requireReviewer(scope, locale);
  const builtIn = await withTransaction(async (client) => {
    const run = clientRun(client);
    const removed = await run("delete from dash_tr_overrides where catalog = $1 and key = $2 and locale = $3", [catalog, key, locale]);
    if ((removed.rowCount ?? 0) === 0) throw new WikiError("not_found", 404);
    await bumpVersion(run, catalog);
    const baseline = await run<{ text: string }>(
      "select text from dash_tr_baselines where catalog = $1 and key = $2 and locale = $3",
      [catalog, key, locale],
    );
    return baseline.rows[0]?.text ?? null;
  });
  await afterOverrideChange(catalog);
  return { catalog, key, locale, text: builtIn };
}

interface TranslatorDbRow {
  user_id: string;
  locale: string;
  display_name: string;
  added_by: string;
  added_at: Date;
}

/** Every translator with the language they were given. */
export async function listTranslators(): Promise<TranslatorRecord[]> {
  const result = await query<TranslatorDbRow>(
    "select user_id, locale, display_name, added_by, added_at from dash_translators order by locale, lower(display_name), user_id",
  );
  return result.rows.map((row) => ({
    userId: row.user_id,
    locale: row.locale,
    displayName: row.display_name,
    addedBy: row.added_by,
    addedAt: iso(row.added_at),
  }));
}

/** The languages a person translates. */
export async function translatorLocales(userId: string): Promise<string[]> {
  const result = await query<{ locale: string }>("select locale from dash_translators where user_id = $1 order by locale", [userId]);
  return result.rows.map((row) => row.locale);
}

/** A name the dashboard already knows for a user: a translator entry, a suggestion, or a wiki name. */
export async function knownTranslatorName(userId: string): Promise<string | null> {
  const result = await query<{ name: string }>(
    `select name from (
       select display_name as name, 1 as priority from dash_translators where user_id = $1
       union all select user_name, 2 from dash_tr_suggestions where user_id = $1
     ) known order by priority limit 1`,
    [userId],
  );
  return result.rows[0]?.name ?? (await knownName(userId));
}

/**
 * Makes a person a translator of a language, or updates the name of an existing entry.
 *
 * @param userId The Discord user id.
 * @param locale A language the tool has.
 * @param displayName The name to show.
 * @param addedBy The admin adding them.
 */
export async function addTranslator(userId: string, locale: string, displayName: string, addedBy: string): Promise<void> {
  if (!(await allLocales()).includes(locale)) throw new WikiError("locale_invalid", 400, "locale");
  await query(
    `insert into dash_translators (user_id, locale, display_name, added_by) values ($1, $2, $3, $4)
     on conflict (user_id, locale) do update set display_name = excluded.display_name`,
    [userId, locale, displayName, addedBy],
  );
}

/** Takes a language away from a translator. */
export async function removeTranslator(userId: string, locale: string): Promise<void> {
  const result = await query("delete from dash_translators where user_id = $1 and locale = $2", [userId, locale]);
  if (result.rowCount === 0) throw new WikiError("not_found", 404);
}
