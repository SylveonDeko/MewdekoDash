import type {Handle} from "@sveltejs/kit";
import {redirect} from "@sveltejs/kit";
import {authenticateUser} from "./lib/server/discordApi";
import { deleteCookies } from "./routes/api/discord/discordAuth";

export const handle: Handle = async ({event, resolve}) => {
    event.locals.user = await authenticateUser(event, event.cookies)
    console.log("handle: " + JSON.stringify(event.locals.user))

    // Check for unauthorized message and delete cookies if it's there
    if(event.locals.user && JSON.stringify(event.locals.user) === "401: Unauthorized") {
        deleteCookies(event.cookies);
    }

    if (event.url.pathname.startsWith('/dashboard')) {
        if (!event.locals.user || JSON.stringify(event.locals.user) === "401: Unauthorized") {
            throw redirect(302, '/api/discord/login')
        }
    }
    return resolve(event);
}
