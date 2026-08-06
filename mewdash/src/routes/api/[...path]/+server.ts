import { env } from "$env/dynamic/private";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import JSONbig from "json-bigint";
import { logger } from "$lib/logger";
import { getSession, verifyAccessToken } from "$lib/server/mobileJwt";
import {
  defaultInstanceURL,
  resolveInstanceURL,
  resolveInstanceURLByPort,
} from "$lib/server/instances";
import { mintBackendToken } from "$lib/server/backendJwt";
import type { DiscordUser } from "$lib/types/discord";

/**
 * Resolved backend target plus the dashboard user behind the request, if one
 * could be identified. `user` drives the per-request backend JWT; it is `null`
 * only for unauthenticated callers (which the bot still accepts via API key
 * during the auth cutover).
 */
interface ResolvedBackend {
  backend: string;
  user: DiscordUser | null;
}

/**
 * Builds the outbound headers for a proxied bot API call. Always sends the
 * server-only `X-API-Key`; additionally sends a short-lived `Authorization:
 * Bearer` backend JWT when the user is known, so the bot can attribute the
 * request to a Discord user for the dashboard audit log.
 */
function botHeaders(user: DiscordUser | null, includeContentType = false): HeadersInit {
  const headers: Record<string, string> = { "X-API-Key": env.MEWDEKO_API_KEY };
  if (includeContentType) headers["Content-Type"] = "application/json";
  const backendToken = user ? mintBackendToken(user) : null;
  if (backendToken) headers["Authorization"] = `Bearer ${backendToken}`;
  return headers;
}

async function makeRequest(
  url: string,
  method: string,
  headers: HeadersInit,
  body?: BodyInit,
) {
  const response = await fetch(url, {
    method,
    headers,
    body,
  });

  try {
    const text = await response.text();
    if (!text || text.length < 1) return json(null);

    try {
      const data = JSONbig.parse(text);

      if (!response.ok) {
        if (data.errors || data.title || data.status) {
          return json(
            {
              error: {
                message: data.title || "API error",
                status: data.status,
                errors: data.errors,
                type: data.type,
              },
            },
            { status: response.status },
          );
        }
        return json(
          { error: "API error", details: data },
          { status: response.status },
        );
      }

      return json(data);
    } catch (jsonError) {
      if (!response.ok) {
        return json({ error: text }, { status: response.status });
      }
      return json({ data: text });
    }
  } catch (error) {
    logger.error(`Error processing response from ${url}:`, error);
    return json({ error: "Failed to process response" }, { status: 500 });
  }
}

/**
 * Resolves which bot instance the proxy should forward to for the current
 * request, and which dashboard user is behind it.
 *
 * Mobile clients (Bearer access JWT) supply an `X-Mobile-Instance` header
 * carrying a `botId`; browser clients (cookie session) supply an
 * `X-Instance-Port` header carrying the selected instance's port. Either way
 * the server resolves the identifier against the primary bot's instance list
 * and builds the URL itself from the host that instance registered, so a
 * tampered header cannot point this proxy (which attaches the bot API key) at
 * an arbitrary internal host. When no header is present, the singleton
 * instance is used; if multiple instances exist a mobile request is rejected
 * so the iOS app can prompt the user to pick one. Mobile users are loaded from
 * the server-only session referenced by the token's `sid`; browser users come
 * from `locals.user`, populated by the auth hook.
 */
/**
 * Resolves the backend target and dashboard user for a mobile (Bearer JWT)
 * request, given the already-extracted token value.
 */
async function resolveMobileBackend(
  bearer: string,
  request: Request,
): Promise<ResolvedBackend | Response> {
  const claims = verifyAccessToken(bearer);
  if (!claims) {
    return json({ error: "invalid_token" }, { status: 401 });
  }

  const session = await getSession(claims.sid);
  const user = session?.user ?? null;
  const instanceId = request.headers.get("x-mobile-instance");

  try {
    if (instanceId) {
      const resolved = await resolveInstanceURL(instanceId);
      if (!resolved) {
        return json({ error: "unknown_instance" }, { status: 404 });
      }
      return { backend: resolved, user };
    }
    const fallback = await defaultInstanceURL();
    if (!fallback) {
      return json(
        {
          error: "select_instance_required",
          message: "Multiple bot instances are configured; specify X-Mobile-Instance.",
        },
        { status: 409 },
      );
    }
    return { backend: fallback, user };
  } catch (err) {
    logger.error("Mobile instance resolution failed", err);
    return json(
      { error: err instanceof Error ? err.message : "instance_resolution_failed" },
      { status: 503 },
    );
  }
}

async function resolveBackend(
  request: Request,
  locals: App.Locals,
): Promise<ResolvedBackend | Response> {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    return resolveMobileBackend(
      authHeader.slice("bearer ".length).trim(),
      request,
    );
  }

  const user = locals.user ?? null;
  const portHeader = request.headers.get("x-instance-port");

  if (!portHeader) {
    const fallback = await defaultInstanceURL();
    if (!fallback) {
      return json(
        {
          error: "no_instance_available",
          message: "No bot instance is registered; check the bot's IsMasterInstance setting.",
        },
        { status: 503 },
      );
    }
    return { backend: fallback, user };
  }

  const port = Number.parseInt(portHeader, 10);
  if (!Number.isInteger(port)) {
    return json({ error: "invalid_instance_port" }, { status: 400 });
  }

  const backend = await resolveInstanceURLByPort(port);
  if (!backend) {
    return json(
      {
        error: "unknown_instance",
        message: `No active bot instance is registered on port ${port}.`,
      },
      { status: 404 },
    );
  }

  return { backend, user };
}

export const GET: RequestHandler = async ({ url, params, request, locals }) => {
  const resolved = await resolveBackend(request, locals);
  if (resolved instanceof Response) return resolved;

  const finalUrl = `${resolved.backend}/${params.path}${url.search || ""}`;

  return makeRequest(finalUrl, "GET", botHeaders(resolved.user));
};

export const POST: RequestHandler = async ({ request, params, locals }) => {
  const resolved = await resolveBackend(request, locals);
  if (resolved instanceof Response) return resolved;
  const url = new URL(request.url);

  let body;
  try {
    const text = await request.text();

    if (text) {
      if (text === "true" || text === "false") {
        body = JSON.parse(text);
      } else {
        body = JSONbig.parse(text);
      }
    } else {
      body = {};
    }
  } catch (error) {
    logger.error("Error parsing request body:", error);
    body = {};
  }

  const jsonBody = typeof body === "boolean"
    ? JSON.stringify(body)
    : JSONbig.stringify(body);

  const finalUrl = `${resolved.backend}/${params.path}${url.search || ""}`;

  return makeRequest(
    finalUrl,
    "POST",
    botHeaders(resolved.user, true),
    jsonBody,
  );
};

export const PUT: RequestHandler = async ({ request, params, locals }) => {
  const resolved = await resolveBackend(request, locals);
  if (resolved instanceof Response) return resolved;
  const url = new URL(request.url);

  let body;
  try {
    const text = await request.text();
    if (text) {
      body = JSONbig.parse(text);
    } else {
      body = {};
    }
  } catch (error) {
    logger.error("Error parsing request body:", error);
    body = {};
  }

  const jsonBody = JSONbig.stringify(body);

  const finalUrl = `${resolved.backend}/${params.path}${url.search || ""}`;

  return makeRequest(
    finalUrl,
    "PUT",
    botHeaders(resolved.user, true),
    jsonBody,
  );
};

export const PATCH: RequestHandler = async ({ request, params, locals }) => {
  const resolved = await resolveBackend(request, locals);
  if (resolved instanceof Response) return resolved;
  const url = new URL(request.url);

  let body;
  try {
    body = await request.json();
  } catch {}

  const finalUrl = `${resolved.backend}/${params.path}${url.search || ""}`;

  return makeRequest(
    finalUrl,
    "PATCH",
    botHeaders(resolved.user, true),
    body ? JSONbig.stringify(body) : undefined,
  );
};

export const DELETE: RequestHandler = async ({ request, params, locals }) => {
  const resolved = await resolveBackend(request, locals);
  if (resolved instanceof Response) return resolved;
  const url = new URL(request.url);

  let body;
  try {
    body = await request.json();
  } catch {}

  const finalUrl = `${resolved.backend}/${params.path}${url.search || ""}`;

  return makeRequest(
    finalUrl,
    "DELETE",
    botHeaders(resolved.user, true),
    body ? JSONbig.stringify(body) : undefined,
  );
};
