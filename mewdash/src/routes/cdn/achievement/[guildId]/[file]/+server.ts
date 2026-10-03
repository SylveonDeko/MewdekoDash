import { env } from "$env/dynamic/private";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { logger } from "$lib/logger";
import { defaultInstanceURL } from "$lib/server/instances";

/**
 * Publicly serves an image a server uploaded as an achievement icon.
 *
 * Instances with a disk-backed CDN serve uploads from there and never reach this route. Everyone else has
 * the bot point at the dashboard, which is public because Discord OAuth requires it. The bytes live in the
 * database, so this route fetches them from the bot with the server-only API key and re-serves them.
 *
 * Upload IDs are never reused, so the response can be cached indefinitely. No authentication: an icon is
 * public the moment an achievement shows it.
 */
export const GET: RequestHandler = async ({ params, fetch }) => {
  const match = /^(\d+)\.png$/i.exec(params.file);
  if (!match || !/^\d+$/.test(params.guildId)) throw error(404, "Not found");

  const backend = await defaultInstanceURL();
  if (!backend) throw error(503, "No bot instance available");

  let response: Response;
  try {
    response = await fetch(`${backend}/achievements/${params.guildId}/icons/${match[1]}`, {
      headers: { "X-API-Key": env.MEWDEKO_API_KEY },
    });
  } catch (err) {
    logger.error("Failed to fetch an achievement icon from the bot:", err);
    throw error(502, "Could not reach the bot");
  }

  if (!response.ok) throw error(response.status === 404 ? 404 : 502, "Icon unavailable");

  return new Response(await response.arrayBuffer(), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
