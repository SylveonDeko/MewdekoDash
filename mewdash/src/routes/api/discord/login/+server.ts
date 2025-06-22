import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { DISCORD_CLIENT_ID, DISCORD_REDIRECT_URI, DISCORD_SCOPES } from "$env/static/private";

export const GET: RequestHandler = async ({ url, cookies }) => {
    // Capture the redirect destination from the referrer or redirect_to parameter
    const redirectTo = url.searchParams.get("redirect_to") ||
      url.searchParams.get("from") ||
      cookies.get("auth_redirect_to");

    // Store the redirect destination in a cookie if it exists and looks valid
    if (redirectTo && (redirectTo.startsWith("/dashboard") || redirectTo === "/")) {
        cookies.set("auth_redirect_to", redirectTo, {
            path: "/",
            maxAge: 600, // 10 minutes
            httpOnly: true
        });
    }

    const authorizeUrl = new URL('https://discord.com/api/oauth2/authorize');
    authorizeUrl.searchParams.append('client_id', DISCORD_CLIENT_ID);
    authorizeUrl.searchParams.append('redirect_uri', DISCORD_REDIRECT_URI);
    authorizeUrl.searchParams.append('response_type', 'code');
    authorizeUrl.searchParams.append('scope', DISCORD_SCOPES);

    throw redirect(302, authorizeUrl.toString());
};