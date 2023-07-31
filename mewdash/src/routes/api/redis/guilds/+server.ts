import type { RequestHandler } from '@sveltejs/kit';
import Redis from 'ioredis';
import { error, json } from "@sveltejs/kit";
import {REDIS_URL, DISCORD_CLIENT_ID} from "$env/static/private";

export const GET: RequestHandler = async (request) => {
    const redis = new Redis(REDIS_URL);
    const data = await redis.get(`${DISCORD_CLIENT_ID}_topguilds`);

    if (!data) {
        throw error(400, "Failed to fetch guild data.");
    }

    const guilds = JSON.parse(data);
    redis.disconnect();
    return json(guilds);
};
