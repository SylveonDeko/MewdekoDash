import type {RequestEvent} from "@sveltejs/kit";
import type {DiscordUser} from "../types/discord";

export async function authenticateUser(event: RequestEvent): Promise<DiscordUser | null> {
    const token = await getOrRefreshToken(event);
    if (!token) {
        return null
    }

    return await fetch(`https://discord.com/api/v10/users/@me`, {
        headers: {'Authorization': `Bearer ${token}`}
    }).then(request => request.json())
}

async function getOrRefreshToken(event: RequestEvent): Promise<string | null> {
    const token = event.cookies?.get('discord_access_token')
    if (token) {
        return token
    }

    // if only refresh token is found, access token has expired
    // fetch refresh only if not already on refresh route (otherwise recursion go brrr)
    const refreshToken = event.cookies?.get('discord_refresh_token')
    if (refreshToken && !event.url.pathname.startsWith('/api/discord/refresh')) {
        const discord_request = await event.fetch(`api/discord/refresh?code=${refreshToken}`)
        const discord_response = await discord_request.json()
        return discord_response.token
    }

    return null
}