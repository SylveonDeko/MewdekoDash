import type { ExportFormat } from "./records";

/** One string as an export writes it. */
export interface FormatEntry {
  key: string;
  group: string;
  source: string;
  text: string | null;
}

/** One string as an uploaded file carries it. */
export interface ParsedEntry {
  key: string;
  source: string;
  text: string | null;
}

/** What an uploaded file holds. */
export interface ParsedFile {
  entries: ParsedEntry[];
  catalog: string | null;
  locale: string | null;
}

export interface ResourceFile {
  path: string;
  content: string;
}

const dangerousStart = /^'*[=+\-@\t\r]/;
const escapedStart = /^'+[=+\-@\t\r]/;

/**
 * Makes a cell safe to open in a spreadsheet: a value a spreadsheet could read as a formula gets a
 * leading apostrophe. {@link csvCellValue} takes it off again, so a file written here reads back as it was.
 *
 * @param value The text of the cell.
 */
export function csvCellText(value: string): string {
  return dangerousStart.test(value) ? `'${value}` : value;
}

/**
 * Undoes {@link csvCellText}.
 *
 * @param value The text of a cell as read from a file.
 */
export function csvCellValue(value: string): string {
  return escapedStart.test(value) ? value.slice(1) : value;
}

function quote(value: string): string {
  const text = csvCellText(value);
  return /["\r\n,]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Writes the strings as CSV with a key, source and translation column, led by a byte order mark so
 * spreadsheets read it as UTF-8.
 *
 * @param entries The strings to write.
 */
export function writeCsv(entries: readonly FormatEntry[]): string {
  const lines = entries.map((entry) => `${quote(entry.key)},${quote(entry.source)},${quote(entry.text ?? "")}`);
  return `﻿key,source,translation\r\n${lines.map((line) => `${line}\r\n`).join("")}`;
}

/**
 * Writes the strings as JSON with the catalog and language they are for.
 *
 * @param catalog The catalog.
 * @param locale The language.
 * @param entries The strings to write.
 */
export function writeJson(catalog: string, locale: string, entries: readonly FormatEntry[]): string {
  return JSON.stringify(
    { catalog, locale, strings: entries.map((entry) => ({ key: entry.key, source: entry.source, translation: entry.text })) },
    null,
    2,
  );
}

/**
 * Writes the strings the way the bundled catalogs keep them: one flat file per group in a folder
 * named for the language, with keys in order. A dashboard key is `<module>.<key>`, so the module is
 * the file and the rest is the key inside it. Strings with no text are left out.
 *
 * @param catalog The catalog.
 * @param locale The language, used as the folder name.
 * @param entries The strings to write.
 */
export function resourceFiles(catalog: string, locale: string, entries: readonly FormatEntry[]): ResourceFile[] {
  const groups = new Map<string, Map<string, string>>();
  for (const entry of entries) {
    if (entry.text === null) continue;
    const group = entry.group || "_common";
    const prefix = `${entry.group}.`;
    const key = catalog === "dash" && entry.group && entry.key.startsWith(prefix) ? entry.key.slice(prefix.length) : entry.key;
    const file = groups.get(group) ?? new Map<string, string>();
    file.set(key, entry.text);
    groups.set(group, file);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([group, strings]) => ({
      path: `${locale}/${group}.json`,
      content: `${JSON.stringify(Object.fromEntries([...strings.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))), null, 2)}\n`,
    }));
}

/**
 * The file extension, media type and a name for a download.
 *
 * @param catalog The catalog.
 * @param locale The language.
 * @param format The export format.
 */
export function exportFileName(catalog: string, locale: string, format: ExportFormat): { name: string; type: string } {
  switch (format) {
    case "csv":
      return { name: `${catalog}-${locale}.csv`, type: "text/csv; charset=utf-8" };
    case "resource":
      return { name: `${catalog}-${locale}.zip`, type: "application/zip" };
    default:
      return { name: `${catalog}-${locale}.json`, type: "application/json; charset=utf-8" };
  }
}

function textOf(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function readItems(list: unknown[]): ParsedEntry[] | null {
  const entries: ParsedEntry[] = [];
  for (const item of list) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) return null;
    const record = item as Record<string, unknown>;
    const key = textOf(record.key);
    if (key === null) return null;
    entries.push({ key, source: textOf(record.source) ?? "", text: textOf(record.translation) ?? textOf(record.text) });
  }
  return entries;
}

/**
 * Reads a JSON upload: the object an export writes, a list of `{ key, source, translation }`, or a
 * flat object of keys and texts.
 *
 * @param content The file's text.
 * @returns The strings, or null when the file cannot be read.
 */
export function readJson(content: string): ParsedFile | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content.replace(/^﻿/, ""));
  } catch {
    return null;
  }
  if (Array.isArray(parsed)) {
    const entries = readItems(parsed);
    return entries ? { entries, catalog: null, locale: null } : null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const root = parsed as Record<string, unknown>;
  const catalog = textOf(root.catalog);
  const locale = textOf(root.locale);
  if (Array.isArray(root.strings)) {
    const entries = readItems(root.strings);
    return entries ? { entries, catalog, locale } : null;
  }
  const entries: ParsedEntry[] = [];
  for (const [key, value] of Object.entries(root)) {
    if (key === "catalog" || key === "locale") continue;
    if (typeof value === "string" || value === null) entries.push({ key, source: "", text: value });
  }
  return { entries, catalog, locale };
}

function parseCsv(content: string): string[][] | null {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < content.length; index++) {
    const char = content[index];
    if (quoted) {
      if (char === '"' && content[index + 1] === '"') {
        cell += '"';
        index++;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") cell += char;
  }
  if (quoted) return null;
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

/**
 * Reads a CSV upload with a `key` column and a `translation` (or `text`) column. A `source` column is
 * read when there is one.
 *
 * @param content The file's text.
 * @returns The strings, or null when the file cannot be read.
 */
export function readCsv(content: string): ParsedFile | null {
  const rows = parseCsv(content.replace(/^﻿/, ""));
  if (!rows || rows.length === 0) return null;
  const header = rows[0].map((cell) => cell.trim().toLowerCase());
  const key = header.indexOf("key");
  const source = header.indexOf("source");
  let text = header.indexOf("translation");
  if (text < 0) text = header.indexOf("text");
  if (key < 0 || text < 0) return null;

  const entries: ParsedEntry[] = [];
  for (const row of rows.slice(1)) {
    if (row.length === 1 && row[0].length === 0) continue;
    const cell = (index: number) => (index >= 0 && index < row.length ? csvCellValue(row[index]) : "");
    const value = cell(text);
    entries.push({ key: cell(key), source: cell(source), text: value.length === 0 ? null : value });
  }
  return { entries, catalog: null, locale: null };
}

/**
 * Reads an upload in the format the caller names.
 *
 * @param format json or csv.
 * @param content The file's text.
 */
export function readFile(format: "json" | "csv", content: string): ParsedFile | null {
  return format === "csv" ? readCsv(content) : readJson(content);
}
