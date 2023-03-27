import type {RequestHandler} from '@sveltejs/kit';
import fetch from 'node-fetch';
import {error} from "@sveltejs/kit";
import {ClientId, ClientSecret, RedirectUri} from "../../../../lib/server/secrets";

export async function GET (request, cookies) {
    const query = request.url.searchParams;
    const code = query.get('code');

    if (!code) {
        return {
            status: 400,
            body: 'Missing authorization code',
        };
    }

    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: ClientId,
            client_secret: ClientSecret,
            grant_type: 'authorization_code',
            code,
            redirect_uri: RedirectUri,
            scope: 'identify guilds',
        }),
    });

    if (!tokenResponse.ok) {
        return {
            status: tokenResponse.status,
            body: await tokenResponse.text(),
        };
    }

    const tokenData = await tokenResponse.json();
    const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
        },
    });

    if (!userResponse.ok) {
        throw error(userResponse.error, userResponse.toString())
    }

    const userData = await userResponse.json();
    const {username, discriminator, avatar} = userData;

    const user = {
        id: userData.id,
        username: `${username}#${discriminator}`,
        avatar: `https://cdn.discordapp.com/avatars/${userData.id}/${avatar}.png`,
    };

    request.locals.session.data = {user};
    cookies.set
    return {
        status: 302,
        headers: {
            location: '/',
            'set-cookie': await request.locals.session.commit(),
        },
    };
};