import {DISCORD_API_URL, DISCORD_CLIENT_ID, DISCORD_SCOPES, DISCORD_REDIRECT_URI} from "$env/static/private";
import type {RequestHandler} from '@sveltejs/kit';

const DISCORD_ENDPOINT = `${DISCORD_API_URL}/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(DISCORD_SCOPES)}`;

export const GET: RequestHandler = async ({locals}) => {
    console.log("login: " + JSON.stringify(locals.user))
    return new Response(null, {
        headers: {Location: locals.user ? "/" : DISCORD_ENDPOINT},
        status: 302
    })
}