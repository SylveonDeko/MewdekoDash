import {PUBLIC_DISCORD_API_URL, PUBLIC_DISCORD_REDIRECT_URI, PUBLIC_DISCORD_SCOPES} from "$env/static/public";
import {DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET} from "$env/static/private";
import type {Cookies} from "@sveltejs/kit";

const ACCESS_TOKEN_COOKIE = "discord_access_token",
    REFRESH_TOKEN_COOKIE = "discord_refresh_token";

export const requestDiscordToken = async (searchParams: URLSearchParams): Promise<Tokens> => {
    // performing a Fetch request to Discord's token endpoint
    const request = await fetch(`${PUBLIC_DISCORD_API_URL}/oauth2/token`, {
        method: 'POST',
        body: searchParams,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })

    const response = await request?.json()

    if (response.error) {
        throw  response.error
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
    searchParams.append("redirect_uri", PUBLIC_DISCORD_REDIRECT_URI);
    searchParams.append("scope", PUBLIC_DISCORD_SCOPES);
    return searchParams;
}

export function setCookies(tokens: Tokens, cookies: Cookies) {
    try {
        cookies.set(
            ACCESS_TOKEN_COOKIE, tokens.access_token,
            {
                path: '/',
                expires: tokens.access_valid_until,
                httpOnly: true,
                sameSite: 'strict',
            }
        )
        cookies.set(
            REFRESH_TOKEN_COOKIE, tokens.refresh_token,
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