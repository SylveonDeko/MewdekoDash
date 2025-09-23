// routes/api/music/events/+server.ts
import type { RequestHandler } from "@sveltejs/kit";
import Redis from "ioredis";
import { REDIS_KEY, REDIS_URL, USE_REDIS } from "$env/static/private";
import { logger } from "$lib/logger";

export const GET: RequestHandler = async ({ url, setHeaders }) => {
  const guildId = url.searchParams.get("guildId");

  if (!guildId) {
    return new Response("Missing guildId", { status: 400 });
  }

  if (USE_REDIS !== "true") {
    return new Response("Redis not enabled", { status: 503 });
  }

  if (!REDIS_KEY) {
    logger.error(
      "REDIS_KEY not configured - should be first 10 characters of bot token",
    );
    return new Response("Redis key not configured", { status: 503 });
  }

  // Set headers for SSE
  setHeaders({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no", // Disable nginx buffering
  });

  // Create readable stream
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const redis = new Redis(REDIS_URL);
      const subscriber = new Redis(REDIS_URL);
      let isStreamClosed = false;

      // Send initial connection message
      controller.enqueue(encoder.encode(`: connected\n\n`));

      // Subscribe to player events for this guild
      // REDIS_KEY should be set to the first 10 characters of the bot token
      const createdChannel = `${REDIS_KEY}:music:player:created:${guildId}`;
      const destroyedChannel = `${REDIS_KEY}:music:player:destroyed:${guildId}`;

      // Cleanup function
      const cleanup = () => {
        isStreamClosed = true;
        subscriber.removeAllListeners();
        subscriber
          .unsubscribe(createdChannel, destroyedChannel)
          .catch(() => {});
        subscriber.disconnect();
        redis.disconnect();
      };

      try {
        await subscriber.subscribe(createdChannel, destroyedChannel);

        subscriber.on("message", (channel, message) => {
          // Check if stream is still open before trying to send
          if (isStreamClosed) return;

          try {
            if (channel === createdChannel) {
              logger.info(`Player created event for guild ${guildId}`);
              const data = JSON.stringify({ event: "playerCreated", guildId });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            } else if (channel === destroyedChannel) {
              logger.info(`Player destroyed event for guild ${guildId}`);
              const data = JSON.stringify({
                event: "playerDestroyed",
                guildId,
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          } catch (err: any) {
            if (err.code === "ERR_INVALID_STATE") {
              // Stream was closed, clean up
              cleanup();
            } else {
              logger.error("Error sending SSE message:", err);
            }
          }
        });

        // Send heartbeat every 30 seconds
        const heartbeatInterval = setInterval(() => {
          if (isStreamClosed) {
            clearInterval(heartbeatInterval);
            return;
          }

          try {
            controller.enqueue(encoder.encode(`: heartbeat\n\n`));
          } catch (err) {
            clearInterval(heartbeatInterval);
            cleanup();
          }
        }, 30000);

        // Store cleanup function for cancel
        (controller as any).cleanup = () => {
          clearInterval(heartbeatInterval);
          cleanup();
        };
      } catch (err) {
        logger.error("Redis subscription error:", err);
        cleanup();
        controller.error(err);
      }
    },

    cancel(controller: any) {
      // Called when the reader cancels the stream
      if (controller.cleanup) {
        controller.cleanup();
      }
    },
  });

  return new Response(stream);
};
