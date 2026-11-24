import { withTransaction } from "$lib/server/db";
import type { Actor } from "$lib/server/wiki/store";
import { exportFileName, readFile, resourceFiles, writeCsv, writeJson, type FormatEntry, type ParsedEntry } from "$lib/translate/formats";
import type { ExportFormat, ExportScope, ImportProblem, ImportSample, ImportSummary, SourceSummary } from "$lib/translate/records";
import { cleanTranslation, translationLimits, translationProblem, translationSourceLocale } from "$lib/translate/rules";
import { buildZip } from "$lib/translate/zip";
import { splitDashKey } from "$lib/translate/overlay";
import { TranslationError } from "./errors";
import { clientRun, poolRun, type Run } from "./run";
import { afterOverrideChange, bumpVersion, requireCatalog, requireLocale, writeOverrides, type OverrideWrite } from "./store";

/** A file ready to be sent as a download. */
export interface ExportFile {
  name: string;
  type: string;
  body: Uint8Array | string;
}

interface StringStateRow {
  key: string;
  grp: string;
  source_text: string;
  override_text: string | null;
  baseline_text: string | null;
}

async function readStates(run: Run, catalog: string, locale: string): Promise<StringStateRow[]> {
  const result = await run<StringStateRow>(
    `select s.key, s.grp, s.source_text, o.text as override_text, b.text as baseline_text
       from dash_tr_strings s
       left join dash_tr_overrides o on o.catalog = s.catalog and o.key = s.key and o.locale = $2
       left join dash_tr_baselines b on b.catalog = s.catalog and b.key = s.key and b.locale = $2
      where s.catalog = $1
      order by s.grp, s.key`,
    [catalog, locale],
  );
  return result.rows;
}

const inUse = (row: StringStateRow): string | null => row.override_text ?? (row.baseline_text !== null && row.baseline_text !== row.source_text ? row.baseline_text : null);

/**
 * Builds the download of a language of a catalog. The English text can be downloaded too, using the
 * source language as the locale. Approved leaves out strings with no approved translation. All
 * lists every string and carries the built-in translation where nothing was approved.
 *
 * @param catalog The catalog.
 * @param locale A language of the tool, or the source language.
 * @param format json, csv or resource, the resource format being one file per group in a folder named for the language.
 * @param scope approved or all.
 */
export async function exportStrings(catalog: string, locale: string, format: ExportFormat, scope: ExportScope): Promise<ExportFile> {
  await requireCatalog(poolRun, catalog);
  const isSource = locale === translationSourceLocale;
  if (!isSource) await requireLocale(poolRun, catalog, locale);

  const rows = await readStates(poolRun, catalog, isSource ? translationSourceLocale : locale);
  const all = scope === "all";
  const entries: FormatEntry[] = rows
    .map((row) => ({
      key: row.key,
      group: row.grp,
      source: row.source_text,
      text: isSource ? row.source_text : all ? inUse(row) : row.override_text,
    }))
    .filter((entry) => entry.text !== null || (all && format !== "resource"));

  const { name, type } = exportFileName(catalog, locale, format);
  if (format === "csv") return { name, type, body: writeCsv(entries) };
  if (format === "resource") return { name, type, body: buildZip(resourceFiles(catalog, locale, entries)) };
  return { name, type, body: writeJson(catalog, locale, entries) };
}

interface ClassifiedImport {
  valid: Array<{ key: string; text: string; source: string; current: string | null }>;
  problems: ImportProblem[];
  unchanged: number;
  empty: number;
  failed: number;
}

function checkContent(content: unknown, format: unknown): { content: string; format: "json" | "csv" } {
  if (typeof content !== "string" || content.trim().length === 0) throw new TranslationError("import_invalid", 400, "content");
  if (content.length > translationLimits.importChars) throw new TranslationError("import_too_large", 413, "content");
  return { content, format: format === "csv" ? "csv" : "json" };
}

function readEntries(content: string, format: "json" | "csv") {
  const file = readFile(format, content);
  if (!file) throw new TranslationError("import_invalid", 400, "content");
  if (file.entries.length > translationLimits.importItems) throw new TranslationError("import_too_many", 400, "content");
  return file;
}

async function classifyImport(run: Run, catalog: string, locale: string, entries: readonly ParsedEntry[]): Promise<ClassifiedImport> {
  const states = new Map((await readStates(run, catalog, locale)).map((row) => [row.key, row]));
  const result: ClassifiedImport = { valid: [], problems: [], unchanged: 0, empty: 0, failed: 0 };
  const seen = new Set<string>();

  const fail = (key: string, error: string) => {
    result.failed++;
    if (result.problems.length < translationLimits.problemsListed) result.problems.push({ key: key.slice(0, translationLimits.keyMax), error });
  };

  for (const entry of entries) {
    if (seen.has(entry.key)) {
      fail(entry.key, "duplicate");
      continue;
    }
    seen.add(entry.key);
    const state = states.get(entry.key);
    if (!state) {
      fail(entry.key, "not_found");
      continue;
    }
    const text = cleanTranslation(entry.text ?? "") ?? "";
    if (text.length === 0) {
      result.empty++;
      continue;
    }
    const current = inUse(state);
    const problem = translationProblem(catalog, state.source_text, text, current);
    if (problem === "translation_unchanged") result.unchanged++;
    else if (problem) fail(entry.key, problem);
    else result.valid.push({ key: entry.key, text, source: state.source_text, current });
  }
  return result;
}

const samplesOf = (valid: ClassifiedImport["valid"]): ImportSample[] =>
  valid.slice(0, translationLimits.samplesListed).map((item) => ({ key: item.key, text: item.text, current: item.current }));

/**
 * Reads an uploaded file of translations and says what it would change. With `apply` the valid
 * strings are saved as approved translations in one transaction, recorded in each string's history
 * as imports. The same checks as a direct save run again on apply, so the check step is never trusted.
 *
 * @param catalog The catalog the file is for.
 * @param locale The language the file is in.
 * @param rawFormat json or csv.
 * @param rawContent The file's text.
 * @param actor The admin.
 * @param apply Whether to save.
 */
export async function importTranslations(
  catalog: string,
  locale: string,
  rawFormat: unknown,
  rawContent: unknown,
  actor: Actor,
  apply: boolean,
): Promise<ImportSummary> {
  const { content, format } = checkContent(rawContent, rawFormat);
  await requireCatalog(poolRun, catalog);
  await requireLocale(poolRun, catalog, locale);

  const file = readEntries(content, format);
  if ((file.catalog !== null && file.catalog !== catalog) || (file.locale !== null && file.locale !== translationSourceLocale && file.locale !== locale)) {
    throw new TranslationError("import_target_mismatch", 400);
  }

  const summarize = (sorted: ClassifiedImport, applied: boolean): ImportSummary => ({
    total: file.entries.length,
    valid: sorted.valid.length,
    unchanged: sorted.unchanged,
    empty: sorted.empty,
    failed: sorted.failed,
    problems: sorted.problems,
    samples: samplesOf(sorted.valid),
    applied,
  });

  if (!apply) return summarize(await classifyImport(poolRun, catalog, locale, file.entries), false);

  const sorted = await withTransaction(async (client) => {
    const run = clientRun(client);
    await run("select pg_advisory_xact_lock(hashtext($1))", [`dash_tr_import:${catalog}:${locale}`]);
    const classified = await classifyImport(run, catalog, locale, file.entries);
    if (classified.valid.length > 0) {
      const writes: OverrideWrite[] = classified.valid.map((item) => ({ key: item.key, text: item.text, source: item.source }));
      await writeOverrides(run, catalog, locale, writes, actor, "import");
      await bumpVersion(run, catalog);
    }
    return classified;
  });
  if (sorted.valid.length > 0) await afterOverrideChange(catalog);
  return summarize(sorted, sorted.valid.length > 0);
}

interface ClassifiedSource {
  valid: Array<{ key: string; text: string; group: string; current: string | null }>;
  problems: ImportProblem[];
  added: number;
  unchanged: number;
  failed: number;
}

const keyPattern = /^[^\s\u0000-\u001f]+$/u;

function cleanSource(raw: string): string {
  return raw.replace(/\r\n?/g, "\n").replace(/\u0000/g, "");
}

async function classifySource(run: Run, catalog: string, entries: readonly ParsedEntry[]): Promise<ClassifiedSource> {
  const stored = await run<{ key: string; source_text: string }>("select key, source_text from dash_tr_strings where catalog = $1", [catalog]);
  const current = new Map(stored.rows.map((row) => [row.key, row.source_text]));
  const result: ClassifiedSource = { valid: [], problems: [], added: 0, unchanged: 0, failed: 0 };
  const seen = new Set<string>();

  const fail = (key: string, error: string) => {
    result.failed++;
    if (result.problems.length < translationLimits.problemsListed) result.problems.push({ key: key.slice(0, translationLimits.keyMax), error });
  };

  for (const entry of entries) {
    if (seen.has(entry.key)) {
      fail(entry.key, "duplicate");
      continue;
    }
    seen.add(entry.key);
    if (entry.key.length === 0 || entry.key.length > translationLimits.keyMax || !keyPattern.test(entry.key)) {
      fail(entry.key, "key_invalid");
      continue;
    }
    const split = catalog === "dash" ? splitDashKey(entry.key) : null;
    if (catalog === "dash" && !split) {
      fail(entry.key, "key_invalid");
      continue;
    }
    const text = cleanSource(entry.text ?? entry.source);
    if (text.trim().length === 0) {
      fail(entry.key, "translation_empty");
      continue;
    }
    if ([...text].length > translationLimits.textMax) {
      fail(entry.key, "translation_too_long");
      continue;
    }
    const before = current.get(entry.key);
    if (before === undefined) {
      result.added++;
      result.valid.push({ key: entry.key, text, group: split?.module ?? "", current: null });
    } else if (before === text) {
      result.unchanged++;
    } else {
      result.valid.push({ key: entry.key, text, group: split?.module ?? "", current: before });
    }
  }
  return result;
}

/**
 * Reads an uploaded file of English texts and adds the strings the catalog does not have and
 * updates the ones whose English text changed. No string is ever removed. A translation written
 * for the old English text is shown as outdated afterwards.
 *
 * @param catalog The catalog.
 * @param rawFormat json or csv.
 * @param rawContent The file's text.
 * @param apply Whether to save.
 */
export async function importSource(catalog: string, rawFormat: unknown, rawContent: unknown, apply: boolean): Promise<SourceSummary> {
  const { content, format } = checkContent(rawContent, rawFormat);
  await requireCatalog(poolRun, catalog);

  const file = readEntries(content, format);
  if ((file.catalog !== null && file.catalog !== catalog) || (file.locale !== null && file.locale !== translationSourceLocale)) {
    throw new TranslationError("import_target_mismatch", 400);
  }

  const summarize = (sorted: ClassifiedSource, applied: boolean): SourceSummary => ({
    total: file.entries.length,
    added: sorted.added,
    changed: sorted.valid.length - sorted.added,
    unchanged: sorted.unchanged,
    failed: sorted.failed,
    problems: sorted.problems,
    samples: samplesOf(sorted.valid.map((item) => ({ key: item.key, text: item.text, source: "", current: item.current }))),
    applied,
  });

  if (!apply) return summarize(await classifySource(poolRun, catalog, file.entries), false);

  const sorted = await withTransaction(async (client) => {
    const run = clientRun(client);
    await run("select pg_advisory_xact_lock(hashtext($1))", [`dash_tr_register:${catalog}`]);
    const classified = await classifySource(run, catalog, file.entries);
    for (let start = 0; start < classified.valid.length; start += 1000) {
      const batch = classified.valid.slice(start, start + 1000);
      await run(
        `insert into dash_tr_strings (catalog, key, grp, source_text)
         select $1, x.key, x.grp, x.source from unnest($2::text[], $3::text[], $4::text[]) as x(key, grp, source)
         on conflict (catalog, key) do update
           set source_text = excluded.source_text, updated_at = now()`,
        [catalog, batch.map((item) => item.key), batch.map((item) => item.group), batch.map((item) => item.text)],
      );
    }
    if (classified.valid.length > 0) await bumpVersion(run, catalog);
    return classified;
  });
  if (sorted.valid.length > 0) await afterOverrideChange(catalog);
  return summarize(sorted, sorted.valid.length > 0);
}
