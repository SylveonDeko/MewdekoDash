import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DISCORD_CLIENT_ID, DISCORD_REDIRECT_URI, DISCORD_SCOPES } from '$env/static/private';

export const GET: RequestHandler = async () => {

    const authorizeUrl = new URL('https://discord.com/api/oauth2/authorize');
    authorizeUrl.searchParams.append('client_id', DISCORD_CLIENT_ID);
    authorizeUrl.searchParams.append('redirect_uri', DISCORD_REDIRECT_URI);
    authorizeUrl.searchParams.append('response_type', 'code');
    authorizeUrl.searchParams.append('scope', DISCORD_SCOPES);

    throw redirect(302, authorizeUrl.toString());
};