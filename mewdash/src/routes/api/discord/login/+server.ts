import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { env } from "$env/dynamic/private";

export const GET: RequestHandler = async ({ url, cookies }) => {
  // Capture the redirect destination from the referrer or redirect_to parameter
  const redirectTo =
    url.searchParams.get("redirect_to") ||
    url.searchParams.get("from") ||
    cookies.get("auth_redirect_to") ||
    "/dashboard";

  // Build state parameter - encode redirect URL in it (base64 for safety)
  const encodedRedirect = Buffer.from(redirectTo).toString("base64");
  const state = `${Date.now()}_${encodedRedirect}`;

  // Also set cookie as fallback
  if (
    redirectTo &&
    (redirectTo.startsWith("/dashboard") ||
      redirectTo.startsWith("/") ||
      redirectTo.startsWith("/forms"))
  ) {
    cookies.set("auth_redirect_to", redirectTo, {
      path: "/",
      maxAge: 600, // 10 minutes
      httpOnly: true,
    });
  }

  const authorizeUrl = new URL("https://discord.com/api/oauth2/authorize");
  authorizeUrl.searchParams.append("client_id", env.DISCORD_CLIENT_ID);
  authorizeUrl.searchParams.append("redirect_uri", env.DISCORD_REDIRECT_URI);
  authorizeUrl.searchParams.append("response_type", "code");
  authorizeUrl.searchParams.append("scope", env.DISCORD_SCOPES);
  authorizeUrl.searchParams.append("state", state);

  redirect(302, authorizeUrl.toString());
};