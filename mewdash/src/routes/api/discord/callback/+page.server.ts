// src/routes/api/discord/callback/+page.server.ts
import { redirect } from "@sveltejs/kit";
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

// routes/api/discord/callback/+page.server.ts
export const load: PageServerLoad = async ({ url, cookies, locals }) => {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // Extract redirect URL from state parameter or fallback to cookie
  let redirectTo = "/dashboard";
  if (state) {
    // Parse state: timestamp_base64url
    const parts = state.split("_");
    if (parts.length >= 2) {
      try {
        const encodedRedirect = parts.slice(1).join("_"); // In case redirect has underscores
        const decodedRedirect = Buffer.from(encodedRedirect, "base64").toString(
          "utf-8",
        );
        // Validate redirect URL for security
        redirectTo = isValidRedirect(decodedRedirect)
          ? decodedRedirect
          : "/dashboard";
      } catch (err) {
        // Fallback to cookie if state parsing fails
        const cookieRedirect = cookies.get("auth_redirect_to") || "/dashboard";
        redirectTo = isValidRedirect(cookieRedirect)
          ? cookieRedirect
          : "/dashboard";
      }
    }
  } else {
    // Fallback to cookie if no state
    const cookieRedirect = cookies.get("auth_redirect_to") || "/dashboard";
    redirectTo = isValidRedirect(cookieRedirect)
      ? cookieRedirect
      : "/dashboard";
  }

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