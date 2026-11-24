import { getLocale, m } from "$lib/i18n";
import { wikiLimits, type WikiErrorCode } from "./validation";

export interface WikiResult<T> {
  ok: boolean;
  data: T | null;
  error: WikiErrorCode | null;
  field: string | null;
}

/**
 * Calls a wiki endpoint of the dashboard.
 *
 * @param method The HTTP method.
 * @param url The endpoint path.
 * @param body A JSON body, if the call has one.
 */
export async function wikiCall<T = Record<string, unknown>>(method: string, url: string, body?: unknown): Promise<WikiResult<T>> {
  try {
    const response = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = (await response.json().catch(() => null)) as (T & { error?: WikiErrorCode; field?: string | null }) | null;
    if (response.ok) return { ok: true, data, error: null, field: null };
    return { ok: false, data: null, error: data?.error ?? "database_unavailable", field: data?.field ?? null };
  } catch {
    return { ok: false, data: null, error: "database_unavailable", field: null };
  }
}

/**
 * Sends a file to a wiki endpoint as a form upload.
 *
 * @param url The endpoint path.
 * @param file The file to send.
 */
export async function wikiUpload<T = Record<string, unknown>>(url: string, file: File): Promise<WikiResult<T>> {
  try {
    const form = new FormData();
    form.set("file", file);
    const response = await fetch(url, { method: "POST", body: form });
    const data = (await response.json().catch(() => null)) as (T & { error?: WikiErrorCode; field?: string | null }) | null;
    if (response.ok) return { ok: true, data, error: null, field: null };
    return { ok: false, data: null, error: data?.error ?? "database_unavailable", field: data?.field ?? null };
  } catch {
    return { ok: false, data: null, error: "database_unavailable", field: null };
  }
}

/**
 * A date and time for display, in the viewer's own format.
 *
 * @param iso An ISO timestamp from an endpoint.
 */
export function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString();
}

/**
 * A language name for a locale code, in the language the dashboard is shown in.
 *
 * @param code A locale such as `de-DE`.
 */
export function localeLabel(code: string): string {
  try {
    return new Intl.DisplayNames([getLocale()], { type: "language", languageDisplay: "standard" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/**
 * The message for an error code returned by a wiki endpoint.
 *
 * @param code The code from the endpoint.
 */
export function wikiErrorMessage(code: WikiErrorCode | null): string {
  switch (code) {
    case "slug_invalid":
      return m.wikiManage.errorSlugInvalid();
    case "slug_reserved":
      return m.wikiManage.errorSlugReserved();
    case "slug_taken":
      return m.wikiManage.errorSlugTaken();
    case "title_required":
      return m.wikiManage.errorTitleRequired();
    case "title_too_long":
    case "summary_too_long":
    case "markdown_too_long":
    case "note_too_long":
    case "reason_too_long":
    case "name_too_long":
      return m.wikiManage.errorTooLong();
    case "tags_too_many":
      return m.wikiManage.tagsTooMany({ max: wikiLimits.tagsMax });
    case "tag_too_long":
      return m.wikiManage.tagTooLong({ max: wikiLimits.tagMax });
    case "category_invalid":
      return m.wikiManage.errorCategoryInvalid();
    case "icon_invalid":
      return m.wikiManage.errorIconInvalid();
    case "href_invalid":
      return m.wikiManage.errorHrefInvalid();
    case "module_invalid":
      return m.wikiManage.errorModuleInvalid();
    case "related_invalid":
      return m.wikiManage.errorRelatedInvalid();
    case "user_id_invalid":
      return m.common.invalidUserId();
    case "no_changes":
      return m.wikiManage.errorNoChanges();
    case "conflict":
      return m.wikiManage.errorConflict();
    case "list_changed":
      return m.wikiManage.errorListChanged();
    case "not_found":
      return m.wikiManage.errorNotFound();
    case "forbidden":
    case "unauthorized":
      return m.wikiManage.errorForbidden();
    case "database_unavailable":
      return m.wikiManage.databaseUnavailable();
    case "category_taken":
      return m.wikiManage.errorCategoryTaken();
    case "category_not_empty":
      return m.wikiManage.errorCategoryNotEmpty();
    case "markdown_too_complex":
      return m.wikiManage.errorMarkdownTooComplex();
    case "suggestions_closed":
      return m.wikiManage.suggestionsClosed();
    case "suggestions_blocked":
      return m.wikiManage.suggestionsBlocked();
    case "already_blocked":
      return m.wikiManage.errorAlreadyBlocked();
    case "rate_limited":
      return m.wikiManage.errorRateLimited();
    case "image_invalid":
      return m.wikiManage.errorImageInvalid();
    case "image_too_large":
      return m.wikiManage.errorImageTooLarge({ size: Math.round(wikiLimits.imageMax / (1024 * 1024)) });
    default:
      return m.common.errorUnexpected();
  }
}
