import { authenticateUser } from "$lib/server/discordApi";
import type { Handle } from "@sveltejs/kit";
import { logger } from "$lib/logger";

export const handle: Handle = async ({ event, resolve }) => {
  try {
    logger.info("Current path:", event.url.pathname);

    // Skip authentication for auth-related endpoints to prevent interference
    const pathname = event.url.pathname;
    if (
      pathname.startsWith("/api/discord/callback") ||
      pathname.startsWith("/api/discord/login") ||
      pathname.startsWith("/api/discord/logout")
    ) {
      return resolve(event);
    }

    // Get user authentication
    const user = await authenticateUser(event, event.cookies);
    logger.info("Auth state:", !!user);
    event.locals.user = user;

    const response = await resolve(event);

    // Ensure auth headers aren't cached
    if (response.headers) {
      response.headers.set("Cache-Control", "no-store");
    }

    return response;
  } catch (error) {
    logger.error("Auth error in hook:", error);
    event.locals.user = null;
    return resolve(event);
  }
};