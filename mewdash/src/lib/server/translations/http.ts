import { json, type RequestEvent } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { wikiEndpoint } from "$lib/server/wiki/http";
import { isReviewer } from "$lib/translate/permissions";
import {
  exportFormats,
  exportScopes,
  queueStatuses,
  stringFilters,
  stringSorts,
  type ExportFormat,
  type ExportScope,
  type QueueStatus,
  type StringFilter,
  type StringQuery,
  type StringSort,
} from "$lib/translate/records";
import { translationLimits } from "$lib/translate/rules";
import { getTranslationAccess, type TranslationAccess } from "./access";
import { TranslationError } from "./errors";

const importBodyBytes = 8_000_000;

type Need = "none" | "member" | "reviewer" | "admin";

/**
 * Wraps a translation endpoint with the wiki's endpoint wrapper, so origin checks, sign in checks,
 * the database check and error responses work the same way. A reviewer is an admin or a
 * translator of at least one language, and the handler still checks the language of what it
 * touches.
 *
 * @param need Who may call the endpoint.
 * @param needsDatabase Whether the endpoint cannot work without the database.
 * @param handler The endpoint body, given the checked access.
 */
export function translateEndpoint<E extends RequestEvent>(
  need: Need,
  needsDatabase: boolean,
  handler: (event: E, access: TranslationAccess) => Promise<Response>,
): (event: E) => Promise<Response> {
  const base = need === "none" ? "none" : need === "admin" ? "admin" : "member";
  return wikiEndpoint<E>(base, needsDatabase, async (event) => {
    const access = await getTranslationAccess(event.locals);
    if (need === "reviewer" && !isReviewer(access.scope)) throw new WikiError("forbidden", 403);
    try {
      return await handler(event, access);
    } catch (error) {
      if (error instanceof TranslationError) return json({ error: error.code, field: error.field ?? null }, { status: error.status });
      throw error;
    }
  });
}

/**
 * Reads a JSON object body of an import or a bulk save, which may be much larger than the wiki's
 * bodies. The limit holds while the body streams in, so a request that lies about its length is
 * still cut off.
 *
 * @param request The request.
 */
export async function readLargeBody(request: Request): Promise<Record<string, unknown>> {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > importBodyBytes) throw new TranslationError("import_too_large", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new WikiError("bad_request");
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > importBodyBytes) {
      await reader.cancel();
      throw new TranslationError("import_too_large", 413);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let position = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, position);
    position += chunk.length;
  }
  try {
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new WikiError("bad_request");
    return parsed as Record<string, unknown>;
  } catch (error) {
    if (error instanceof WikiError) throw error;
    throw new WikiError("bad_request");
  }
}

/** A required text query parameter, or a bad request. */
export function requiredParam(url: URL, name: string, max = 200): string {
  const value = url.searchParams.get(name);
  if (value === null || value.length === 0 || value.length > max) throw new WikiError("bad_request", 400, name);
  return value;
}

/** A page number from `?page=`, at least 1. */
export function pageParam(url: URL): number {
  const page = Number(url.searchParams.get("page") ?? "1");
  return Number.isInteger(page) && page >= 1 && page <= 100_000 ? page : 1;
}

/** The list query from `?catalog=&locale=&group=&filter=&q=&page=`. */
export function stringQueryFrom(url: URL): StringQuery {
  const group = url.searchParams.get("group");
  return {
    catalog: requiredParam(url, "catalog", 32),
    locale: requiredParam(url, "locale", 32),
    group: group ? group.slice(0, 80) : null,
    filter: filterParam(url),
    sort: sortParam(url),
    search: (url.searchParams.get("q") ?? "").slice(0, translationLimits.searchMax),
    page: pageParam(url),
  };
}

/** The filter from `?filter=`, `all` when missing or unknown. */
export function filterParam(url: URL): StringFilter {
  const filter = url.searchParams.get("filter");
  return stringFilters.includes(filter as StringFilter) ? (filter as StringFilter) : "all";
}

/** The sort from `?sort=`, `key` when missing or unknown. */
export function sortParam(url: URL): StringSort {
  const sort = url.searchParams.get("sort");
  return stringSorts.includes(sort as StringSort) ? (sort as StringSort) : "key";
}

/** The status from `?status=`, `open` when missing or unknown. */
export function statusParam(url: URL): QueueStatus {
  const status = url.searchParams.get("status");
  return queueStatuses.includes(status as QueueStatus) ? (status as QueueStatus) : "open";
}

/** The export format from `?format=`, a bad request when missing or unknown. */
export function formatParam(url: URL): ExportFormat {
  const format = url.searchParams.get("format");
  if (!exportFormats.includes(format as ExportFormat)) throw new WikiError("bad_request", 400, "format");
  return format as ExportFormat;
}

/** The export scope from `?scope=`, `approved` when missing or unknown. */
export function scopeParam(url: URL): ExportScope {
  const scope = url.searchParams.get("scope");
  return exportScopes.includes(scope as ExportScope) ? (scope as ExportScope) : "approved";
}
