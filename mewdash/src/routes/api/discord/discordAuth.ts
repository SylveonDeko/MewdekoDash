import {
    COOKIE_ENCRYPTION_PASSWORD,
    DISCORD_API_URL,
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    DISCORD_REDIRECT_URI,
    DISCORD_SCOPES
} from "$env/static/private";
import type { Cookies } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
import CryptoJS from "crypto-js";


const ACCESS_TOKEN_COOKIE = "discord_access_token",
    REFRESH_TOKEN_COOKIE = "discord_refresh_token";

export const requestDiscordToken = async (searchParams: URLSearchParams, cookies: Cookies): Promise<Tokens | any> => {
    // performing a Fetch request to Discord's token endpoint
    const request = await fetch(`${DISCORD_API_URL}/oauth2/token`, {
        method: 'POST',
        body: searchParams,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    const response = await request?.json()
    if (request.status == 400 || request.status == 401)
    {
        deleteCookies(cookies)
        return redirect(302, '/api/discord/login')
    }

    if (response.error) {
        throw response.error
    }

    // redirect user to front page with cookies set
    const access_expire = new Date(Date.now() + response.expires_in); // 10 minutes
    const refresh_expire = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    return {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        access_valid_until: access_expire,
        refresh_valid_until: refresh_expire
    }
}

export function buildSearchParams(type: 'callback' | 'refresh', code: string): URLSearchParams {
    const searchParams = new URLSearchParams()
    searchParams.append("client_id", DISCORD_CLIENT_ID);
    searchParams.append("client_secret", DISCORD_CLIENT_SECRET);
    searchParams.append("grant_type", type == "callback" ? "authorization_code" : "refresh_token");
    searchParams.append(type == "callback" ? "code" : "refresh_token", code);
    searchParams.append("redirect_uri", DISCORD_REDIRECT_URI);
    searchParams.append("scope", DISCORD_SCOPES);
    return searchParams;
}

export function setCookies(tokens: Tokens, cookies: Cookies) {
    try {
        const encryptedAccessToken = CryptoJS.AES.encrypt(tokens.access_token, COOKIE_ENCRYPTION_PASSWORD).toString();
        const encryptedRefreshToken = CryptoJS.AES.encrypt(tokens.refresh_token, COOKIE_ENCRYPTION_PASSWORD).toString();

        cookies.set(
            ACCESS_TOKEN_COOKIE, encryptedAccessToken,
            {
                path: '/',
                expires: tokens.access_valid_until,
                httpOnly: true,
                sameSite: 'strict',
            }
        )
        cookies.set(
            REFRESH_TOKEN_COOKIE, encryptedRefreshToken,
            {
                path: '/',
                expires: tokens.refresh_valid_until,
                httpOnly: true,
                sameSite: 'strict',
            }
        )
    } catch (e) {
        console.error("could not set cookies:" + e)
    }
}

export async function getUserGuilds(cookies: Cookies): Promise<{status: number, data: any}> {
    let encryptedToken = cookies?.get('discord_access_token');
    let token = null;

    if (encryptedToken) {
        const bytes = CryptoJS.AES.decrypt(encryptedToken, COOKIE_ENCRYPTION_PASSWORD);
        token = bytes.toString(CryptoJS.enc.Utf8);
    }

    if (!token) {
        return {status: 400, data: "No token provided"};
    }
    const response = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        return {status: response.status, data: `Failed to fetch user guilds: ${response.statusText}`};
    }
    return {status: 200, data: await response.json()};
}



export function deleteCookies(cookies: Cookies) {
    cookies.delete(ACCESS_TOKEN_COOKIE, {path: '/'})
    cookies.delete(REFRESH_TOKEN_COOKIE, {path: '/'})
}

export type Tokens = {
    access_token: string,
    refresh_token: string,
    access_valid_until: Date,
    refresh_valid_until: Date
}