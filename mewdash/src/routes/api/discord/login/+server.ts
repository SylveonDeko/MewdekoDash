import {DISCORD_CLIENT_ID} from "$env/static/private";
import {PUBLIC_DISCORD_API_URL, PUBLIC_DISCORD_REDIRECT_URI, PUBLIC_DISCORD_SCOPES} from "$env/static/public";
import type {RequestHandler} from '@sveltejs/kit';

const DISCORD_ENDPOINT = `${PUBLIC_DISCORD_API_URL}/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(PUBLIC_DISCORD_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(PUBLIC_DISCORD_SCOPES)}`;

export const GET: RequestHandler = async ({locals}) => {
    return new Response(null, {
        headers: {Location: locals.user ? "/" : DISCORD_ENDPOINT},
        status: 302
    })
}