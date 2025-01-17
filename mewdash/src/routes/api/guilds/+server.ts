import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { getUserGuilds } from "../discord/discordAuth.ts";

export const GET: RequestHandler = async ({ locals, cookies }) => {
  if (!locals.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const guilds = await getUserGuilds(cookies);
    return json(guilds);
  } catch (error) {
    return new Response('Failed to fetch guilds', { status: 500 });
  }
};