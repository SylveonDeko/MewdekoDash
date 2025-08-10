// src/routes/api/discord/callback/+page.server.ts
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { buildSearchParams, getUserData, requestDiscordToken, setCookies } from "../discordAuth";
import { logger } from "$lib/logger";

// routes/api/discord/callback/+page.server.ts
export const load: PageServerLoad = async ({ url, cookies, locals }) => {
    const code = url.searchParams.get('code');

    // Get the stored redirect destination
    const redirectTo = cookies.get("auth_redirect_to") || "/?loggedin";

    // Clean up the redirect cookie
    cookies.delete("auth_redirect_to", { path: "/" });
    
    if (!code) {
        throw redirect(303, redirectTo);
    }

    // Check if we've already processed this code
    const processedCode = cookies.get('processed_oauth_code');
    if (processedCode === code) {
        cookies.delete('processed_oauth_code', { path: '/' });
        throw redirect(303, redirectTo);
    }

    try {
        const tokens = await requestDiscordToken(
          buildSearchParams('callback', code),
          cookies
        );

        const userData = await getUserData(tokens.access_token);
        locals.user = userData;
        
        // Set cookies with user data for session creation
        await setCookies(tokens, cookies, userData);

        // Mark this code as processed
        cookies.set('processed_oauth_code', code, {
            path: '/',
            maxAge: 60, // Only keep for 1 minute
            httpOnly: true
        });

        // Use 302 redirect to ensure cookies are sent properly
        const finalRedirect = redirectTo.startsWith("/dashboard") ? "/dashboard" : redirectTo;
        throw redirect(302, finalRedirect);
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

        // Even on error, try to redirect to the intended destination
        throw redirect(303, redirectTo);
    }
};