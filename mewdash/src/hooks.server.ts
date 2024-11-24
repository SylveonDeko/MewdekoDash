import type { Handle } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
import { authenticateUser } from "$lib/server/discordApi";
import { deleteCookies } from "./routes/api/discord/discordAuth";

const UNAUTHORIZED_STATUS_MESSAGE = "401: Unauthorized";

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.user = await authenticateUser(event, event.cookies);
  const userStatus = JSON.stringify(event.locals.user);
  console.log("handle: " + userStatus);
  // Check for unauthorized message and delete cookies if it's there
  validateUser(userStatus, event);
  return resolve(event);
};

function validateUser(userStatus: string, event: any) {
  if (userStatus === UNAUTHORIZED_STATUS_MESSAGE) {
    deleteCookies(event.cookies);
  }
  if (
    event.url.pathname.startsWith("/dashboard") &&
    !isAuthenticated(userStatus)
  ) {
    throw redirect(302, "/api/discord/login");
  }
}

function isAuthenticated(userStatus: string) {
  return userStatus && userStatus !== UNAUTHORIZED_STATUS_MESSAGE;
}
