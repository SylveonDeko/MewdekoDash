import { authenticateUser } from "$lib/server/discordApi";
import type { Handle } from "@sveltejs/kit";
import { logger } from "$lib/logger";

export const handle: Handle = async ({ event, resolve }) => {
  try {
    logger.debug('Current path:', event.url.pathname);

    // Get user authentication
    const user = await authenticateUser(event, event.cookies);
    logger.debug('Auth state:', !!user);
    event.locals.user = user;

    const response = await resolve(event);

    // Ensure auth headers aren't cached
    if (response.headers) {
      response.headers.set('Cache-Control', 'no-store');
    }

    return response;
  } catch (error) {
    logger.error('Auth error in hook:', error);
    event.locals.user = null;
    return resolve(event);
  }
};