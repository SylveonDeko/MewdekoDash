import { m } from "$lib/i18n";
import { wikiErrorMessage } from "$lib/wiki/client";
import type { WikiErrorCode } from "$lib/wiki/validation";
import { cleanTranslation, htmlProblem, isHtmlCatalog, placeholdersMatch, placeholdersOf, translationLimits } from "./rules";

/**
 * The message for an error code returned by a translation endpoint.
 *
 * @param code The code from the endpoint.
 */
export function translationErrorMessage(code: WikiErrorCode | null): string {
  switch (code) {
    case "translation_empty":
      return m.translate.errorTextEmpty();
    case "translation_too_long":
      return m.translate.errorTextTooLong({ max: translationLimits.textMax });
    case "translation_unchanged":
      return m.wikiManage.errorNoChanges();
    case "placeholders_mismatch":
      return m.translate.errorPlaceholders();
    case "html_mismatch":
      return m.translate.problemHtml();
    case "too_many_suggestions":
      return m.translate.errorTooManySuggestions({ max: translationLimits.openSuggestionsMax });
    case "locale_invalid":
      return m.translate.errorLocale();
    default:
      return wikiErrorMessage(code);
  }
}

/** A group's file name without the leading underscore of the shared group. */
export function groupLabel(group: string): string {
  return group.replace(/^_/, "");
}

/**
 * The problem to show under a field before anything is sent, or null. Nothing is said about an
 * empty field.
 *
 * @param catalog The catalog the string belongs to.
 * @param source The string's source text.
 * @param draft What the person typed.
 */
export function draftProblem(catalog: string, source: string, draft: string): string | null {
  const text = cleanTranslation(draft) ?? "";
  if (text.length === 0) return null;
  if ([...text].length > translationLimits.textMax) return m.translate.errorTextTooLong({ max: translationLimits.textMax });
  if (!placeholdersMatch(source, text)) {
    const wanted = [...new Set(placeholdersOf(source))];
    return wanted.length > 0 ? m.translate.problemPlaceholders({ placeholders: wanted.join(" ") }) : m.translate.problemNoPlaceholders();
  }
  if (isHtmlCatalog(catalog) && htmlProblem(source, text)) return m.translate.problemHtml();
  return null;
}
