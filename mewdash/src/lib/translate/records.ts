/** Shapes the translation tool and its endpoints exchange. Row ids are decimal strings. */

export type StringFilter = "all" | "untranslated" | "outdated" | "suggestions";

export const stringFilters: readonly StringFilter[] = ["all", "untranslated", "outdated", "suggestions"];

export type TranslationStatus = "open" | "approved" | "declined" | "replaced";

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
  search: string;
  page: number;
}

export interface HistoryEntry {
  id: string;
  text: string;
  sourceText: string;
  userId: string;
  userName: string;
  status: TranslationStatus;
  declineReason: string;
  createdAt: string;
  reviewedAt: string | null;
  reviewedByName: string | null;
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
