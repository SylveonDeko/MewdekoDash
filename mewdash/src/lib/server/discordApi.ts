// lib/server/discordApi.ts
import type { Cookies, RequestEvent } from "@sveltejs/kit";
import {
  DISCORD_API_URL,
  COOKIE_ENCRYPTION_PASSWORD,
} from "$env/static/private";
import type { DiscordUser } from "../types/discord";
import {
  buildSearchParams,
  requestDiscordToken,
  setCookies,
  shouldRefreshToken,
} from "../../routes/api/discord/discordAuth";
import { sessionManager } from "$lib/server/redisSession";
import * as CryptoJS from "crypto-js";

// Track failed refresh attempts to prevent infinite loops
const failedRefreshTokens = new Set<string>();

export async function authenticateUser(
  event: RequestEvent,
  cookies: Cookies,
): Promise<DiscordUser | null> {
  try {
    // Try to get user from Redis session first
    const sessionId = cookies.get("discord_session_id");
    if (sessionId) {
      const session = await sessionManager.getSession(sessionId);
      if (session && session.user) {
        // Check if we need to refresh tokens
        if (shouldRefreshToken(cookies)) {
          await getOrRefreshToken(event, cookies);
        }
        return session.user;
      }
    }
    
    // Fallback to token-based auth
    const token = await getOrRefreshToken(event, cookies);
    if (!token) {
      return null;
    }

    const userResponse = await fetch(`${DISCORD_API_URL}/users/@me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!userResponse.ok) {
      // If the access token is also invalid, clear everything
      const { deleteCookies } = await import("../../routes/api/discord/discordAuth");
      await deleteCookies(cookies);
      return null;
    }
    
    const user = await userResponse.json();
    
    // Try to create session if we got a user
    if (user && user.id) {
      const encryptedRefreshToken = cookies.get("discord_refresh_token");
      if (encryptedRefreshToken) {
        const bytes = CryptoJS.AES.decrypt(
          encryptedRefreshToken,
          COOKIE_ENCRYPTION_PASSWORD,
        );
        const refreshToken = bytes.toString(CryptoJS.enc.Utf8);
        const accessExpiry = cookies.get("discord_access_expiry");
        
        if (refreshToken && accessExpiry) {
          const newSessionId = await sessionManager.createSession(user, {
            accessToken: token,
            refreshToken: refreshToken,
            accessExpiry: new Date(accessExpiry)
          });
          
          if (newSessionId) {
            cookies.set("discord_session_id", newSessionId, {
              path: "/",
              expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
              httpOnly: true,
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production"
            });
          }
        }
      }
    }
    
    return user;
  } catch (error) {
    console.error("Authentication error:", error);
    // Clear cookies on any authentication error
    try {
      const { deleteCookies } = await import("../../routes/api/discord/discordAuth");
      await deleteCookies(cookies);
    } catch (deleteError) {
      console.error("Failed to delete cookies in auth error:", deleteError);
    }
    return null;
  }
}

export async function getOrRefreshToken(
  event: RequestEvent,
  cookies: Cookies,
): Promise<string | null> {
  let encryptedToken = event.cookies?.get("discord_access_token");
  let token = null;
  if (encryptedToken) {
    const bytes = CryptoJS.AES.decrypt(
      encryptedToken,
      COOKIE_ENCRYPTION_PASSWORD,
    );
    token = bytes.toString(CryptoJS.enc.Utf8);
  }

  // Check if we should proactively refresh the token
  if (token && shouldRefreshToken(cookies)) {
    // Try to refresh proactively
    const refreshed = await tryRefreshToken(event, cookies);
    if (refreshed) {
      return refreshed;
    }
    // If refresh failed, continue with existing token
  }

  if (token) {
    return token;
  }

  // if only refresh token is found, access token has expired
  // fetch refresh only if not already on refresh route (otherwise recursion go brrr)
  let encryptedRefreshToken = event.cookies?.get("discord_refresh_token");
  let refreshToken = null;
  if (encryptedRefreshToken) {
    const bytes = CryptoJS.AES.decrypt(
      encryptedRefreshToken,
      COOKIE_ENCRYPTION_PASSWORD,
    );
    refreshToken = bytes.toString(CryptoJS.enc.Utf8);
  }

  if (refreshToken && !event.url.pathname.startsWith("/api/discord/refresh")) {
    return await tryRefreshToken(event, cookies);
  }

  return null;
}

async function tryRefreshToken(
  event: RequestEvent,
  cookies: Cookies,
  retries = 1 // Reduce retries to prevent spam
): Promise<string | null> {
  let encryptedRefreshToken = event.cookies?.get("discord_refresh_token");
  if (!encryptedRefreshToken) return null;
  
  const bytes = CryptoJS.AES.decrypt(
    encryptedRefreshToken,
    COOKIE_ENCRYPTION_PASSWORD,
  );
  const refreshToken = bytes.toString(CryptoJS.enc.Utf8);
  
  if (!refreshToken) return null;
  
  // Check if this token has already failed recently
  if (failedRefreshTokens.has(refreshToken)) {
    console.log("Skipping refresh attempt for known bad token");
    return null;
  }
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const tokens = await requestDiscordToken(
        buildSearchParams("refresh", refreshToken)
        // Don't pass cookies to requestDiscordToken to avoid premature deletion
      );
      
      // Remove from failed set if refresh succeeds
      failedRefreshTokens.delete(refreshToken);
      
      await setCookies(tokens, event.cookies);
      return tokens.access_token;
    } catch (error) {
      console.error(`Token refresh attempt ${attempt + 1} failed:`, error);
      
      // If it's a permanent error, mark token as failed and delete cookies immediately
      if (error instanceof Error && 
          (error.message.includes("Invalid refresh token") || 
           error.message.includes("Refresh token expired"))) {
        
        // Mark this token as permanently failed
        failedRefreshTokens.add(refreshToken);
        
        // Clean up failed tokens periodically (keep only last 100)
        if (failedRefreshTokens.size > 100) {
          const tokensArray = Array.from(failedRefreshTokens);
          failedRefreshTokens.clear();
          tokensArray.slice(-50).forEach(token => failedRefreshTokens.add(token));
        }
        
        try {
          const { deleteCookies } = await import("../../routes/api/discord/discordAuth");
          await deleteCookies(event.cookies);
        } catch (deleteError) {
          console.error("Failed to delete cookies:", deleteError);
        }
        break;
      }
      
      // For other errors, retry if we have attempts left
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }
  
  return null;
}
