import { json, type RequestEvent } from "@sveltejs/kit";
import { logger } from "$lib/logger";
import { availableLocales } from "$lib/i18n";
import { localeProblem, type WikiErrorCode } from "$lib/wiki/validation";
import { getAccess, type Access } from "./access";
import { WikiError } from "./errors";

const maxBodyBytes = 400_000;

type Need = "none" | "member" | "editor" | "admin";

/**
 * Wraps an endpoint: checks the caller against what the endpoint needs, runs it, and turns
 * failures into JSON errors. Writes must come from the dashboard's own origin.
 *
 * @param need Who may call the endpoint.
 * @param needsDatabase Whether the endpoint cannot work without the wiki database.
 * @param handler The endpoint body, given the checked access.
 */
export function wikiEndpoint<E extends RequestEvent>(
  need: Need,
  needsDatabase: boolean,
  handler: (event: E, access: Access) => Promise<Response>,
): (event: E) => Promise<Response> {
  return async (event) => {
    try {
      if (event.request.method !== "GET" && event.request.method !== "HEAD") {
        const origin = event.request.headers.get("origin");
        if (origin !== null && origin !== event.url.origin) throw new WikiError("forbidden", 403);
      }

      const access = await getAccess(event.locals);
      if (need !== "none" && access.userId === null) throw new WikiError("unauthorized", 401);
      if (need === "editor" && !access.canEdit) throw new WikiError("forbidden", 403);
      if (need === "admin" && !access.canManageEditors) throw new WikiError("forbidden", 403);
      if (needsDatabase && !access.databaseAvailable) throw new WikiError("database_unavailable", 503);

      return await handler(event, access);
    } catch (error) {
      return failure(error);
    }
  };
}

/** Turns a thrown value into a JSON error response. */
export function failure(error: unknown): Response {
  if (error instanceof WikiError) {
    return json({ error: error.code, field: error.field ?? null }, { status: error.status });
  }
  logger.error("Wiki endpoint failed:", error);
  return json({ error: "database_unavailable" satisfies WikiErrorCode, field: null }, { status: 503 });
}

/**
 * Reads a JSON object body with a size limit.
 *
 * @param request The request.
 */
export async function readBody(request: Request): Promise<Record<string, unknown>> {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > maxBodyBytes) throw new WikiError("bad_request", 413);
  const text = await request.text();
  if (text.length > maxBodyBytes) throw new WikiError("bad_request", 413);
  try {
    const parsed: unknown = JSON.parse(text);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new WikiError("bad_request");
    return parsed as Record<string, unknown>;
  } catch (error) {
    if (error instanceof WikiError) throw error;
    throw new WikiError("bad_request");
  }
}

/** Throws when the locale is not one the dashboard has. */
export function requireLocale(locale: unknown): string {
  const problem = localeProblem(locale, availableLocales());
  if (problem) throw new WikiError(problem, 400, "locale");
  return locale as string;
}

/** The actor for store calls, from checked access. */
export function actorOf(access: Access): { id: string; name: string } {
  return { id: access.userId as string, name: access.name };
}
