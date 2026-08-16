import { env } from "$env/dynamic/private";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { logger } from "$lib/logger";
import { defaultInstanceURL } from "$lib/server/instances";

/**
 * Content types for the extensions the bot accepts when an avatar is uploaded. The extension travels in
 * the URL rather than being stored, so this is where it becomes a real content type again.
 */
const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
};

/**
 * Publicly serves a "send as" persona avatar that was uploaded through the embed builder.
 *
 * Discord fetches a webhook avatar by URL, so an uploaded image needs a public address. Instances with a
 * disk-backed CDN serve it from there directly and never reach this route. Everyone else, Docker
 * self-hosters included, has the bot point at the dashboard instead: the dashboard is already public
 * because Discord OAuth requires it, while the bot API is not. The bytes live in the database, so this
 * route fetches them from the bot with the server-only API key and re-serves them.
 *
 * The URL is version-stamped by the bot, so a replaced avatar gets a new URL and this response can be
 * cached indefinitely. No authentication: an avatar is public the moment a message is posted with it.
 */
export const GET: RequestHandler = async ({ params, fetch }) => {
  const match = /^v\d+\.([a-z0-9]+)$/i.exec(params.file);
  if (!match || !/^\d+$/.test(params.id)) throw error(404, "Not found");

  const contentType = CONTENT_TYPES[match[1].toLowerCase()];
  if (!contentType) throw error(404, "Not found");

  const backend = await defaultInstanceURL();
  if (!backend) throw error(503, "No bot instance available");

  let response: Response;
  try {
    response = await fetch(`${backend}/Embeds/personas/${params.id}/avatar`, {
      headers: { "X-API-Key": env.MEWDEKO_API_KEY },
    });
  } catch (err) {
    logger.error("Failed to fetch persona avatar from the bot:", err);
    throw error(502, "Could not reach the bot");
  }

  if (!response.ok) throw error(response.status === 404 ? 404 : 502, "Avatar unavailable");

  return new Response(await response.arrayBuffer(), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
