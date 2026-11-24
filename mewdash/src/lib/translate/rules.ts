export const translationLimits = {
  textMax: 4000,
  openSuggestionsMax: 200,
  pageSize: 50,
  reasonMax: 300,
  nameMax: 80,
  searchMax: 100,
  keyMax: 200,
  bulkMax: 100,
  openSuggestionsCap: 1000,
  importChars: 4_000_000,
  importItems: 20_000,
  problemsListed: 100,
  samplesListed: 10,
} as const;

/** The language every string is written in. It is never translated in the tool. */
export const translationSourceLocale = "en-US";

/** Catalogs whose text is rendered as HTML somewhere, so translations must keep the source's tags. */
export function isHtmlCatalog(catalog: string): boolean {
  return catalog === "dash";
}

export type TranslationProblem =
  | "translation_empty"
  | "translation_too_long"
  | "translation_unchanged"
  | "placeholders_mismatch"
  | "html_mismatch";

const placeholderPattern = /\{[^\s{}]+\}/g;
const tagPattern = /<\/?[a-zA-Z][^<>]*>/g;
const eventAttributePattern = /[\s/"']on[a-z]+\s*=/i;
const scriptUrlPattern = /java\s*script\s*:/i;

/**
 * Every `{...}` token with no whitespace inside, as exact strings, in a stable order. A token that
 * appears twice is listed twice.
 *
 * @param text A source or translated text.
 */
export function placeholdersOf(text: string): string[] {
  return (text.match(placeholderPattern) ?? []).sort();
}

function difference(a: readonly string[], b: readonly string[]): string[] {
  const left = [...b];
  const result: string[] = [];
  for (const item of a) {
    const index = left.indexOf(item);
    if (index === -1) result.push(item);
    else left.splice(index, 1);
  }
  return result;
}

/**
 * Compares the placeholders of a translation with the source text's as multisets.
 *
 * @param source The source text.
 * @param text The translation.
 * @returns The placeholders the translation lacks and the ones it adds. Both are empty when they match.
 */
export function placeholderDiff(source: string, text: string): { missing: string[]; extra: string[] } {
  const want = placeholdersOf(source);
  const have = placeholdersOf(text);
  return { missing: difference(want, have), extra: difference(have, want) };
}

/** True when the translation has exactly the source text's placeholders. */
export function placeholdersMatch(source: string, text: string): boolean {
  const { missing, extra } = placeholderDiff(source, text);
  return missing.length === 0 && extra.length === 0;
}

function normalizeTag(tag: string): string {
  return tag
    .replace(/^<(\/?)([a-zA-Z][a-zA-Z0-9-]*)/, (_all, slash: string, name: string) => `<${slash}${name.toLowerCase()}`)
    .replace(/\s+/g, " ")
    .replace(/\s+(\/?>)$/, "$1");
}

/**
 * Every HTML tag in a text, normalised so spacing and the case of the tag name do not matter,
 * in a stable order.
 *
 * @param text A source or translated text.
 */
export function htmlTagsOf(text: string): string[] {
  return (text.match(tagPattern) ?? []).map(normalizeTag).sort();
}

/**
 * Whether a translation can safely be rendered as HTML where the source is: it has the same tags
 * as the source, no `on...=` attributes and no `javascript:` URLs.
 *
 * @param source The source text.
 * @param text The translation.
 */
export function htmlProblem(source: string, text: string): "html_mismatch" | null {
  if (scriptUrlPattern.test(text)) return "html_mismatch";
  const tags = text.match(tagPattern) ?? [];
  if (tags.some((tag) => eventAttributePattern.test(tag))) return "html_mismatch";
  const want = htmlTagsOf(source);
  const have = htmlTagsOf(text);
  if (want.length !== have.length || want.some((tag, index) => tag !== have[index])) return "html_mismatch";
  return null;
}

/**
 * Cleans submitted text: line endings become `\n`, null characters are dropped and the ends are
 * trimmed.
 *
 * @param raw The submitted value.
 * @returns The cleaned text, or null when the value is not a string.
 */
export function cleanTranslation(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  return raw.replace(/\r\n?/g, "\n").replace(/\u0000/g, "").trim();
}

/**
 * The checks on how a translation is built: placeholders and, for catalogs rendered as HTML, tags.
 *
 * @param catalog The catalog the string belongs to.
 * @param source The string's source text.
 * @param text The translation.
 */
export function structureProblem(catalog: string, source: string, text: string): TranslationProblem | null {
  if (!placeholdersMatch(source, text)) return "placeholders_mismatch";
  if (isHtmlCatalog(catalog)) return htmlProblem(source, text);
  return null;
}

/**
 * Every rule a new translation must pass.
 *
 * @param catalog The catalog the string belongs to.
 * @param source The string's current source text.
 * @param text The cleaned translation, from {@link cleanTranslation}.
 * @param current The translation in force now (the override, else the built-in one), if any.
 * @returns The first rule that failed, or null.
 */
export function translationProblem(catalog: string, source: string, text: string, current: string | null): TranslationProblem | null {
  if (text.length === 0) return "translation_empty";
  if ([...text].length > translationLimits.textMax) return "translation_too_long";
  if (current !== null && (text === current || text === current.trim())) return "translation_unchanged";
  return structureProblem(catalog, source, text);
}

/**
 * Escapes the characters that mean something in a SQL `like` pattern, for a search term that is
 * matched literally.
 *
 * @param term What the visitor typed.
 */
export function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, (char) => `\\${char}`);
}
