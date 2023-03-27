import type {RequestHandler} from '@sveltejs/kit';
import {error} from "@sveltejs/kit";
import {buildSearchParams, requestDiscordToken, setCookies} from "../discordAuth";

export const GET: RequestHandler = async ({url, cookies}) => {
    const discord_refresh_token = url.searchParams.get('code');
    if (!discord_refresh_token) {
        throw error(500, JSON.stringify({error: 'No refresh token found'}))
    }
    const tokens = await requestDiscordToken(buildSearchParams("identify guilds", "refresh", discord_refresh_token));
    setCookies(tokens, cookies)
    return new Response(
        JSON.stringify({token: tokens.access_token}), {
            status: 200
        }
    )
}