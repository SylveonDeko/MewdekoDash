// src/routes/api/discord/callback/+page.server.ts
import { redirect, type Cookies } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import {
  buildSearchParams,
  getUserData,
  requestDiscordToken,
  setCookies,
} from "../discordAuth";
import { logger } from "$lib/logger";

// Helper function to validate redirect URLs (prevent open redirects)
function isValidRedirect(url: string): boolean {
    // Only allow internal paths
    if (!url.startsWith('/')) return false;
    // Prevent protocol-relative URLs
    if (url.startsWith('//')) return false;
    // Allow specific paths
    return url.startsWith('/dashboard') ||
           url.startsWith('/forms') ||
           url === '/' ||
           url.startsWith('/commands') ||
           url.startsWith('/contacts') ||
           url.startsWith('/staff') ||
           url.startsWith('/placeholders') ||
           url.startsWith('/credguide') ||
           url.startsWith('/privacy') ||
           url.startsWith('/terms') ||
           url.startsWith('/reviews');
}

/**
 * Resolves a safe in-app redirect target from the OAuth `state` parameter,
 * falling back to the `auth_redirect_to` cookie and then `/dashboard`.
 */
function resolveRedirectTarget(state: string | null, cookies: Cookies): string {
  const fromCookie = () => {
    const cookieRedirect = cookies.get("auth_redirect_to") || "/dashboard";
    return isValidRedirect(cookieRedirect) ? cookieRedirect : "/dashboard";
  };

  if (!state) return fromCookie();

  // Parse state: timestamp_base64url
  const parts = state.split("_");
  if (parts.length < 2) return "/dashboard";

  try {
    const encodedRedirect = parts.slice(1).join("_"); // In case redirect has underscores
    const decodedRedirect = Buffer.from(encodedRedirect, "base64").toString(
      "utf-8",
    );
    return isValidRedirect(decodedRedirect) ? decodedRedirect : "/dashboard";
  } catch {
    return fromCookie();
  }
}

// routes/api/discord/callback/+page.server.ts
export const load: PageServerLoad = async ({ url, cookies, locals }) => {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const redirectTo = resolveRedirectTarget(state, cookies);

  // Clean up the redirect cookie
  cookies.delete("auth_redirect_to", { path: "/" });

  if (!code) {
    redirect(303, redirectTo);
  }

  // Check if we've already processed this code
  const processedCode = cookies.get("processed_oauth_code");
  if (processedCode === code) {
    cookies.delete("processed_oauth_code", { path: "/" });
    redirect(303, redirectTo);
  }

  try {
    const tokens = await requestDiscordToken(
      buildSearchParams("callback", code),
      cookies,
    );

    const userData = await getUserData(tokens.access_token);
    locals.user = userData;

    // Set cookies with user data for session creation
    await setCookies(tokens, cookies, userData);

    // Mark this code as processed
    cookies.set("processed_oauth_code", code, {
      path: "/",
      maxAge: 60, // Only keep for 1 minute
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production" || false,
    });

    // Use 302 redirect to ensure cookies are sent properly
    redirect(302, redirectTo);
  } catch (error) {
    // Check if it's a redirect (not an actual error)
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      "location" in error
    ) {
      // This is a redirect, not an error - just re-throw it
      throw error;
    }

    if (error instanceof Error) {
      logger.error("Callback error details:", {
        error: error.message,
        name: error.name,
        status: (error as any).status,
        response: (error as any).response,
      });
    } else {
      logger.error("Callback error details:", { error });
    }

    // Even on error, try to redirect to the intended destination
    redirect(303, redirectTo);
  }
};