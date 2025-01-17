// src/routes/api/discord/callback/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { buildSearchParams, getUserData, requestDiscordToken, setCookies } from "../discordAuth";
import { logger } from "$lib/logger";

// routes/api/discord/callback/+page.server.ts
export const load: PageServerLoad = async ({ url, cookies, locals }) => {
    const code = url.searchParams.get('code');
    if (!code) {
        throw redirect(302, '/');
    }

    // Check if we've already processed this code
    const processedCode = cookies.get('processed_oauth_code');
    if (processedCode === code) {
        // Already processed this code, redirect to intended destination
        const returnTo = cookies.get('returnTo') || '/dashboard';
        cookies.delete('returnTo', { path: '/' });
        cookies.delete('processed_oauth_code', { path: '/' });
        throw redirect(302, returnTo);
    }

    try {
        const tokens = await requestDiscordToken(
          buildSearchParams('callback', code),
          cookies
        );

        setCookies(tokens, cookies);

        // Mark this code as processed
        cookies.set('processed_oauth_code', code, {
            path: '/',
            maxAge: 60, // Only keep for 1 minute
            httpOnly: true
        });

        const userData = await getUserData(tokens.access_token);
        locals.user = userData;

        const returnTo = cookies.get('returnTo') || '/dashboard';
        cookies.delete('returnTo', { path: '/' });

        return { success: true, returnTo };
    } catch (error) {
        logger.error('Callback error details:', {
            error: error.message,
            name: error.name,
            status: error.status,
            response: error.response
        });

        throw redirect(302, '/?error=auth_failed');
    }
};