// routes/api/pm2/download/+server.ts
import { env } from "$env/dynamic/private";
import type { RequestHandler } from "./$types";
import { defaultInstanceURL, resolveInstanceURLByPort } from "$lib/server/instances";
import { mintBackendToken } from "$lib/server/backendJwt";
import { logger } from "$lib/logger";

/**
 * Streams a pm2 log file from the bot to the browser as a download. The generic `/api`
 * proxy buffers every response and wraps non JSON bodies, which is wrong for a log that
 * can run to hundreds of megabytes, so this route pipes the bot's response body through
 * untouched. Like the proxy it resolves the instance from the registered list and
 * attaches the server-only API key plus the caller's backend JWT, which the bot uses to
 * confirm the caller is an owner before it opens the file.
 */
export const GET: RequestHandler = async ({ url, request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response("Not signed in", { status: 401 });
  }

  const pmId = Number.parseInt(url.searchParams.get("pmId") ?? "", 10);
  if (!Number.isInteger(pmId)) {
    return new Response("pmId is required", { status: 400 });
  }

  const stream = url.searchParams.get("stream") === "error" ? "error" : "out";
  const portText = url.searchParams.get("port") ?? request.headers.get("x-instance-port");

  let backend: string | null;
  if (portText) {
    const port = Number.parseInt(portText, 10);
    if (!Number.isInteger(port)) {
      return new Response("Invalid instance port", { status: 400 });
    }
    backend = await resolveInstanceURLByPort(port);
    if (!backend) {
      return new Response(`No active bot instance is registered on port ${port}`, { status: 404 });
    }
  } else {
    backend = await defaultInstanceURL();
    if (!backend) {
      return new Response("No bot instance is registered", { status: 503 });
    }
  }

  const headers: Record<string, string> = { "X-API-Key": env.MEWDEKO_API_KEY };
  const token = mintBackendToken(user);
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let upstream: Response;
  try {
    upstream = await fetch(`${backend}/Pm2/logs/${pmId}/download?stream=${stream}`, { headers });
  } catch (err) {
    logger.error("pm2 log download could not reach the bot:", err);
    return new Response("The bot instance could not be reached", { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    return new Response(text || `Download failed with status ${upstream.status}`, {
      status: upstream.status || 502,
    });
  }

  const responseHeaders = new Headers({
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Disposition":
      upstream.headers.get("content-disposition") ?? `attachment; filename="pm2-${pmId}-${stream}.log"`,
    "Cache-Control": "no-store",
  });
  const length = upstream.headers.get("content-length");
  if (length) responseHeaders.set("Content-Length", length);

  return new Response(upstream.body, { status: 200, headers: responseHeaders });
};
