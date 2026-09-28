// routes/api/music/stream/+server.ts
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { defaultInstanceURL, resolveInstanceURL, resolveInstanceURLByPort } from "$lib/server/instances";
import { mintBackendToken } from "$lib/server/backendJwt";
import { getSession, verifyAccessToken } from "$lib/server/mobileJwt";
import { logger } from "$lib/logger";
import type { DiscordUser } from "$lib/types/discord";

/**
 * Live music status for the web player, as Server-Sent Events.
 *
 * The bot's `music/{guildId}/events` endpoint streams `event: status` frames
 * over plain HTTP when asked with `Accept: text/event-stream`. This route
 * opens that stream from the server with the server-only API key and a short
 * lived backend JWT for the signed in user, which is what the bot's dashboard
 * access filter checks, and pipes the body to the client untouched. Nothing
 * is parsed or buffered: one upstream request and one downstream response
 * per open player.
 *
 * Two kinds of caller:
 * - Browser: the session cookie identifies the user; the instance comes from
 *   the `instance` query parameter (the selected instance's port, since
 *   EventSource cannot send headers).
 * - Mobile: an `Authorization: Bearer` mobile access token identifies the
 *   user through its server-side session; the instance comes from the
 *   `X-Mobile-Instance` header (a bot id).
 * Either way the instance is resolved against the registered list, so the
 * client never names a host.
 */
export const GET: RequestHandler = async ({ url, locals, request }) => {
  const guildId = url.searchParams.get("guildId");
  if (!guildId || !/^\d+$/.test(guildId)) throw error(400, "Missing guildId");

  let user: DiscordUser | null = null;
  let backend: string | null = null;

  const bearer = (request.headers.get("authorization") ?? "").replace(/^bearer\s+/i, "");
  try {
    if (bearer) {
      const claims = verifyAccessToken(bearer);
      if (!claims) throw error(401, "Invalid token");
      const session = await getSession(claims.sid);
      if (!session) throw error(401, "Session revoked");
      user = session.user;
      const instanceId = request.headers.get("x-mobile-instance");
      backend = instanceId ? await resolveInstanceURL(instanceId) : await defaultInstanceURL();
    } else {
      user = locals.user;
      if (!user) throw error(401, "Not signed in");
      const port = Number(url.searchParams.get("instance"));
      backend = Number.isFinite(port) && port > 0 ? await resolveInstanceURLByPort(port) : await defaultInstanceURL();
    }
  } catch (err) {
    if (typeof err === "object" && err !== null && "status" in err) throw err;
    logger.error("music stream: instance resolution failed", err);
  }
  if (!user) throw error(401, "Not signed in");
  if (!backend) throw error(503, "No bot instance available");

  const headers: Record<string, string> = {
    "X-API-Key": env.MEWDEKO_API_KEY,
    Accept: "text/event-stream",
  };
  const token = mintBackendToken(user);
  if (token) headers["Authorization"] = `Bearer ${token}`;

  /* Tie the upstream request to the browser's connection so closing the tab
     releases the bot's SSE registration straight away. */
  const upstreamAbort = new AbortController();
  request.signal.addEventListener("abort", () => upstreamAbort.abort(), { once: true });

  let upstream: Response;
  try {
    upstream = await fetch(`${backend}/music/${guildId}/events?userId=${encodeURIComponent(String(user.id))}`, {
      headers,
      signal: upstreamAbort.signal,
    });
  } catch (err) {
    logger.error("music stream: upstream request failed", err);
    throw error(502, "Bot unreachable");
  }

  if (!upstream.ok || !upstream.body) {
    throw error(upstream.status === 401 || upstream.status === 403 ? upstream.status : 502, "Bot refused the stream");
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
};
