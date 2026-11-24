/** Shapes the translation tool and its endpoints exchange. Row ids are decimal strings. */

export type StringFilter = "all" | "untranslated" | "approved" | "outdated" | "suggestions";

export const stringFilters: readonly StringFilter[] = ["all", "untranslated", "approved", "outdated", "suggestions"];

export type StringSort = "key" | "added" | "approved" | "suggested";

export const stringSorts: readonly StringSort[] = ["key", "added", "approved", "suggested"];

export type TranslationStatus = "open" | "approved" | "declined" | "replaced";

export type HistoryStatus = TranslationStatus | "reverted";

export type TranslationOrigin = "suggestion" | "edit" | "import" | "restore";

export type HistoryOrigin = TranslationOrigin | "revert";

export type QueueStatus = "open" | "approved" | "declined" | "all";

export const queueStatuses: readonly QueueStatus[] = ["open", "approved", "declined", "all"];

export type ExportFormat = "json" | "csv" | "resource";

export const exportFormats: readonly ExportFormat[] = ["json", "csv", "resource"];

export type ExportScope = "approved" | "all";

export const exportScopes: readonly ExportScope[] = ["approved", "all"];

export interface LanguageProgress {
  locale: string;
  total: number;
  untranslated: number;
  outdated: number;
  openSuggestions: number;
}

export interface CatalogOverview {
  catalog: string;
  total: number;
  groups: string[];
  languages: LanguageProgress[];
}

export interface StringRow {
  key: string;
  group: string;
  source: string;
  translation: string | null;
  hasOverride: boolean;
  untranslated: boolean;
  outdated: boolean;
  previousSource: string | null;
  openSuggestions: number;
  mine: { id: string; text: string } | null;
  updatedByName: string | null;
  updatedAt: string | null;
}

export interface StringPage {
  rows: StringRow[];
  total: number;
  page: number;
  pageSize: number;
}

export interface StringQuery {
  catalog: string;
  locale: string;
  group: string | null;
  filter: StringFilter;
  sort: StringSort;
  search: string;
  page: number;
}

export interface HistoryEntry {
  id: string;
  text: string;
  sourceText: string;
  userId: string;
  userName: string;
  status: HistoryStatus;
  origin: HistoryOrigin;
  declineReason: string;
  createdAt: string;
  reviewedAt: string | null;
  reviewedByName: string | null;
}

/** The translation in force for one string and language, with who wrote it and who approved it. */
export interface CurrentTranslation {
  text: string;
  builtIn: boolean;
  writtenByName: string | null;
  approvedByName: string | null;
  approvedAt: string | null;
}

export interface HistoryResult {
  current: CurrentTranslation | null;
  entries: HistoryEntry[];
}

/** An edit not saved yet. It is ready when it passes the checks the server makes. */
export interface RowDraft {
  text: string;
  ready: boolean;
}

export interface BulkItemResult {
  key: string;
  saved: boolean;
  error: string | null;
}

export interface BulkResult {
  mode: "edit" | "suggest";
  results: BulkItemResult[];
  saved: number;
  failed: number;
}

/** A string of an uploaded file that cannot be used, with the reason as an error code. */
export interface ImportProblem {
  key: string;
  error: string;
}

/** A string an upload would save, next to the text it replaces. */
export interface ImportSample {
  key: string;
  text: string;
  current: string | null;
}

export interface ImportSummary {
  total: number;
  valid: number;
  unchanged: number;
  empty: number;
  failed: number;
  problems: ImportProblem[];
  samples: ImportSample[];
  applied: boolean;
}

export interface SourceSummary {
  total: number;
  added: number;
  changed: number;
  unchanged: number;
  failed: number;
  problems: ImportProblem[];
  samples: ImportSample[];
  applied: boolean;
}

export interface ContributorRecord {
  userId: string;
  name: string;
  suggested: number;
  approved: number;
  declined: number;
  open: number;
  direct: number;
  approvalPercent: number | null;
  lastAt: string;
  blocked: boolean;
}

export interface ContributorPage {
  rows: ContributorRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TranslationSettings {
  suggestionsOpen: boolean;
  openSuggestionsMax: number;
}

export interface SuggestionRecord {
  id: string;
  catalog: string;
  key: string;
  group: string;
  locale: string;
  text: string;
  sourceText: string;
  currentSource: string | null;
  currentText: string | null;
  userId: string;
  userName: string;
  status: TranslationStatus;
  declineReason: string;
  createdAt: string;
  reviewedAt: string | null;
  reviewedByName: string | null;
}

export interface SuggestionPage {
  rows: SuggestionRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TranslatorRecord {
  userId: string;
  locale: string;
  displayName: string;
  addedBy: string;
  addedAt: string;
}

export interface OverrideResult {
  catalog: string;
  key: string;
  locale: string;
  text: string | null;
}

/** Dashboard overrides for one language, as `{ module: { key: text } }`. */
export type OverlayCatalog = Record<string, Record<string, string>>;
