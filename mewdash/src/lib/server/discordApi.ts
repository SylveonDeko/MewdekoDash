import type {Cookies, RequestEvent} from "@sveltejs/kit";
import {DISCORD_API_URL, COOKIE_ENCRYPTION_PASSWORD} from "$env/static/private"
import type {DiscordUser} from "../types/discord";
import {buildSearchParams, requestDiscordToken, setCookies} from "../../routes/api/discord/discordAuth";
import * as CryptoJS from 'crypto-js';


export async function authenticateUser(event: RequestEvent, cookies: Cookies): Promise<DiscordUser | null> {
    const token = await getOrRefreshToken(event, cookies);
    if (!token) {
        return null
    }

    return await fetch(`${DISCORD_API_URL}/users/@me`, {
        headers: {'Authorization': `Bearer ${token}`}
    }).then(request => request.json())
}

export async function getOrRefreshToken(event: RequestEvent, cookies: Cookies): Promise<string | null> {
    let encryptedToken = event.cookies?.get('discord_access_token');
    let token = null;
    if (encryptedToken) {
        const bytes = CryptoJS.AES.decrypt(encryptedToken, COOKIE_ENCRYPTION_PASSWORD);
        token = bytes.toString(CryptoJS.enc.Utf8);
    }

    if (token) {
        return token
    }

    // if only refresh token is found, access token has expired
    // fetch refresh only if not already on refresh route (otherwise recursion go brrr)
    let encryptedRefreshToken = event.cookies?.get('discord_refresh_token');
    let refreshToken = null;
    if (encryptedRefreshToken) {
        const bytes = CryptoJS.AES.decrypt(encryptedRefreshToken, COOKIE_ENCRYPTION_PASSWORD);
        refreshToken = bytes.toString(CryptoJS.enc.Utf8);
    }

    if (refreshToken && !event.url.pathname.startsWith('/api/discord/refresh')) {
        const tokens = await requestDiscordToken(buildSearchParams("refresh", refreshToken), cookies);
        setCookies(tokens, event.cookies)
        return tokens.access_token
    }

    return null
}
