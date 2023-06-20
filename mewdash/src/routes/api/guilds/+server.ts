import type { RequestHandler } from '@sveltejs/kit';
import { getUserGuilds } from '../discord/discordAuth';
import { error, json } from "@sveltejs/kit";

export const GET: RequestHandler = async (request) => {
    const guilds = await getUserGuilds(request.cookies);
    if (guilds.status !== 200 || !guilds.data) {
        throw error(400, "Failed to fetch guilds.")
    }
    return json(guilds.data)
};
