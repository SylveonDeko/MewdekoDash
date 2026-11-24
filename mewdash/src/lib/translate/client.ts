import { m } from "$lib/i18n";
import { wikiErrorMessage } from "$lib/wiki/client";
import type { WikiErrorCode } from "$lib/wiki/validation";
import { cleanTranslation, htmlProblem, isHtmlCatalog, placeholdersMatch, placeholdersOf, translationLimits } from "./rules";

/**
 * The message for an error code returned by a translation endpoint.
 *
 * @param code The code from the endpoint.
 */
export function translationErrorMessage(code: string | null): string {
  switch (code) {
    case "duplicate":
      return m.translate.errorDuplicate();
    case "already_suggested":
      return m.translate.errorAlreadySuggested();
    case "blocked":
      return m.translate.errorBlocked();
    case "suggestions_closed":
      return m.translate.errorSuggestionsClosed();
    case "bulk_empty":
      return m.translate.errorBulkEmpty();
    case "bulk_too_many":
      return m.translate.errorBulkTooMany();
    case "history_not_restorable":
      return m.translate.errorHistoryNotRestorable();
    case "import_invalid":
      return m.translate.errorImportInvalid();
    case "import_target_mismatch":
      return m.translate.errorImportTargetMismatch();
    case "import_too_large":
      return m.translate.errorImportTooLarge();
    case "import_too_many":
      return m.translate.errorImportTooMany();
    case "key_invalid":
      return m.translate.errorKeyInvalid();
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
      return m.translate.errorTooManySuggestions();
    case "locale_invalid":
      return m.translate.errorLocale();
    default:
      return wikiErrorMessage(code as WikiErrorCode | null);
  }
}

/** The message for the problem of one string in a bulk save or an upload. */
export function itemErrorMessage(code: string | null): string {
  return code === "not_found" ? m.translate.errorStringNotFound() : translationErrorMessage(code);
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
