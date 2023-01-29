import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    return new Response("", {
        headers: { Location:  `https://discord.com/api/oauth2/authorize?client_id=${env.DISCORD_CLIENT_ID}&redirect_uri=${env.DISCORD_REDIRECT_URI}&response_type=code&scope=identify%20guilds`},
        status: 302
    });
}