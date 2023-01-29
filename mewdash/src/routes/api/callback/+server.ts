import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, url}) => {
    const returnCode = url.searchParams.get("code")?.toString();

    if (returnCode == null) {
        return error(400, "Invalid return Code");
    }

    const dataObject = {
        client_id: env.DISCORD_CLIENT_ID,
        client_secret: env.DISCORD_CLIENT_SECRET,
        redirect_uri: env.DISCORD_REDIRECT_URI,
        grant_type: 'authorization_code',
        code: returnCode.toString()
    };

    const request = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams(dataObject),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (request.status != 200) {
        throw error(request.status, request.statusText)
    }

    const response = await request.json();

	const access_token_expires_in = new Date(Date.now() + response.expires_in);
    const refresh_token_expires_in = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    cookies.set('disco_access_token', response.access_token, {
        secure: !dev,
        httpOnly: true,
        path: '/',
        expires: access_token_expires_in
    });
    cookies.set('disco_refresh_token', response.refresh_token, {
        secure: !dev,
        httpOnly: true,
        path: '/',
        expires: refresh_token_expires_in
    });
    throw redirect(302, '/')
}