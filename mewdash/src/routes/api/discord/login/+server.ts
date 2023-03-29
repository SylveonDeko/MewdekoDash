import type {RequestHandler} from '@sveltejs/kit';
import {ClientId, RedirectUri} from "../../../../lib/server/secrets";
const DISCORD_ENDPOINT = `https://discord.com/api/oauth2/authorize?client_id=${ClientId}&redirect_uri=${encodeURIComponent(RedirectUri)}&response_type=code&scope=identify guilds`;

export const GET: RequestHandler = async ({locals}) => {
    return new Response(null, {
        headers: {Location: locals.user ? "/" : DISCORD_ENDPOINT},
        status: 302
    })
}