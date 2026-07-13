import { logger } from "$lib/logger";
import { resolveInstanceURL } from "$lib/server/mobileInstances";
import type { RequestHandler } from "./$types";

const TWITCH_HEADERS = [
  "Twitch-Eventsub-Message-Id",
  "Twitch-Eventsub-Message-Retry",
  "Twitch-Eventsub-Message-Type",
  "Twitch-Eventsub-Message-Signature",
  "Twitch-Eventsub-Message-Timestamp",
  "Twitch-Eventsub-Subscription-Type",
  "Twitch-Eventsub-Subscription-Version",
];

/**
 * Routes a public Twitch EventSub delivery to the registered localhost bot
 * instance. The dashboard never handles the instance's signing secret; the
 * bot verifies the original Twitch headers and raw request body itself.
 */
export const POST: RequestHandler = async ({ request, params }) => {
  const backend = await resolveInstanceURL(params.botId);
  if (!backend) {
    logger.warn(`Rejected Twitch EventSub delivery for unknown bot ${params.botId}`);
    return new Response(null, { status: 404 });
  }

  const body = await request.arrayBuffer();
  const headers = new Headers({ "Content-Type": "application/json" });
  for (const name of TWITCH_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  try {
    const response = await fetch(`${backend}/twitch/eventsub`, {
      method: "POST",
      headers,
      body,
    });
    const responseBody = await response.arrayBuffer();
    const contentType = response.headers.get("content-type");
    return new Response(responseBody.byteLength ? responseBody : null, {
      status: response.status,
      headers: contentType ? { "Content-Type": contentType } : undefined,
    });
  } catch (error) {
    logger.error(`Failed to route Twitch EventSub to bot ${params.botId}`, error);
    return new Response(null, { status: 502 });
  }
};
