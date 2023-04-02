import type {Handle} from "@sveltejs/kit";
import {redirect} from "@sveltejs/kit";
import {authenticateUser} from "./lib/server/discordApi";

export const handle: Handle = async ({event, resolve}) => {
    event.locals.user = await authenticateUser(event)
    console.log("handle: " + JSON.stringify(event.locals.user))
    if (event.url.pathname.startsWith('/dashboard')) {
        if (!event.locals.user) {
            throw redirect(302, '/api/discord/login')
        }
    }
    return resolve(event);
}