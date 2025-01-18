// src/routes/api/discord/callback/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { buildSearchParams, getUserData, requestDiscordToken, setCookies } from "../discordAuth";
import { logger } from "$lib/logger";

// routes/api/discord/callback/+page.server.ts
export const load: PageServerLoad = async ({ url, cookies, locals }) => {
    const code = url.searchParams.get('code');
    if (!code) {
        throw redirect(303, "/?loggedin");
    }

    // Check if we've already processed this code
    const processedCode = cookies.get('processed_oauth_code');
    if (processedCode === code) {
        cookies.delete('processed_oauth_code', { path: '/' });
        throw redirect(303, "/?loggedin");
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

        throw redirect(303, "/?loggedin");
    } catch (error) {
        if (error instanceof Error) {
            logger.error('Callback error details:', {
                error: error.message,
                name: error.name,
                status: (error as any).status,
                response: (error as any).response
            });
        } else {
            logger.error('Callback error details:', { error });
        }

        throw redirect(303, "/?loggedin");
    }
};