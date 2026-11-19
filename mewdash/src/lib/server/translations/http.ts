import type { RequestEvent } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { wikiEndpoint } from "$lib/server/wiki/http";
import { isReviewer } from "$lib/translate/permissions";
import { stringFilters, type StringFilter, type StringQuery } from "$lib/translate/records";
import { translationLimits } from "$lib/translate/rules";
import { getTranslationAccess, type TranslationAccess } from "./access";

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
    return handler(event, access);
  });
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
    search: (url.searchParams.get("q") ?? "").slice(0, translationLimits.searchMax),
    page: pageParam(url),
  };
}

/** The filter from `?filter=`, `all` when missing or unknown. */
export function filterParam(url: URL): StringFilter {
  const filter = url.searchParams.get("filter");
  return stringFilters.includes(filter as StringFilter) ? (filter as StringFilter) : "all";
}
