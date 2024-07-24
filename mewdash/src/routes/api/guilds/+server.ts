import type { RequestHandler } from '@sveltejs/kit';
import { getUserGuilds } from '../discord/discordAuth';
import { json } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ cookies }) => {
    try {
        const guilds = await getUserGuilds(cookies);
        if (guilds.status !== 200 || !guilds.data) {
            return new Response(JSON.stringify({ error: "Failed to fetch guilds" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        return json(guilds.data);
    }
    catch (ex) {
        console.error(ex);
        return new Response(JSON.stringify({ error: "An error occurred while fetching guilds" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};