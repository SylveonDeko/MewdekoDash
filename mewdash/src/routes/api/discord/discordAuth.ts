// routes/api/discord/discordAuth.ts
import {
  COOKIE_ENCRYPTION_PASSWORD,
  DISCORD_API_URL,
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_REDIRECT_URI,
  DISCORD_SCOPES
} from "$env/static/private";
import type { Cookies } from "@sveltejs/kit";
import CryptoJS from "crypto-js";
import { logger } from "$lib/logger";
import { sessionManager } from "$lib/server/redisSession";
import type { DiscordUser } from "$lib/types/discord";

const ACCESS_TOKEN_COOKIE = "discord_access_token",
  REFRESH_TOKEN_COOKIE = "discord_refresh_token",
  ACCESS_EXPIRY_COOKIE = "discord_access_expiry",
  SESSION_ID_COOKIE = "discord_session_id",
  TOKEN_REFRESH_THRESHOLD = 0.8; // Refresh when 80% of token lifetime has passed

export const requestDiscordToken = async (
  searchParams: URLSearchParams,
  cookies?: Cookies, // Make cookies optional
): Promise<Tokens> => {
  // performing a Fetch request to Discord's token endpoint
  const request = await fetch(`${DISCORD_API_URL}/oauth2/token`, {
    method: "POST",
    body: searchParams,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const response = await request?.json();

  // Handle different error types appropriately
  if (request.status == 400) {
    // Bad request - likely invalid refresh token
    logger.error("Token refresh failed with 400:", response);
    // Don't delete cookies here - let caller handle it
    throw new Error("Invalid refresh token");
  } else if (request.status == 401) {
    // Unauthorized - refresh token expired
    logger.error("Token refresh failed with 401:", response);
    // Don't delete cookies here - let caller handle it
    throw new Error("Refresh token expired");
  } else if (!request.ok) {
    // Other errors - don't immediately delete cookies
    logger.error(`Token request failed with status ${request.status}:`, response);
    throw new Error(`Token request failed: ${request.statusText}`);
  }

  if (response.error) {
    throw new Error(response.error);
  }

  // Calculate expiry times
  const access_expire = new Date(Date.now() + (response.expires_in * 1000)); // Discord returns seconds
  const refresh_expire = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  return {
    access_token: response.access_token,
    refresh_token: response.refresh_token,
    access_valid_until: access_expire,
    refresh_valid_until: refresh_expire,
  };
};

export async function getUserData(accessToken: string): Promise<any> {
  const response = await fetch(`${DISCORD_API_URL}/users/@me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user data: ${response.statusText}`);
  }

  return response.json();
}

export function buildSearchParams(
  type: "callback" | "refresh",
  code: string,
): URLSearchParams {
  const searchParams = new URLSearchParams();
  searchParams.append("client_id", DISCORD_CLIENT_ID);
  searchParams.append("client_secret", DISCORD_CLIENT_SECRET);
  searchParams.append(
    "grant_type",
    type == "callback" ? "authorization_code" : "refresh_token",
  );
  searchParams.append(type == "callback" ? "code" : "refresh_token", code);
  searchParams.append("redirect_uri", DISCORD_REDIRECT_URI);
  searchParams.append("scope", DISCORD_SCOPES);
  return searchParams;
}

export async function setCookies(tokens: Tokens, cookies: Cookies, user?: DiscordUser) {
  try {
    const encryptedAccessToken = CryptoJS.AES.encrypt(
      tokens.access_token,
      COOKIE_ENCRYPTION_PASSWORD,
    ).toString();
    const encryptedRefreshToken = CryptoJS.AES.encrypt(
      tokens.refresh_token,
      COOKIE_ENCRYPTION_PASSWORD,
    ).toString();

    cookies.set(ACCESS_TOKEN_COOKIE, encryptedAccessToken, {
      path: "/",
      expires: tokens.access_valid_until,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });
    
    // Store the expiry time as well for proactive refresh
    cookies.set(ACCESS_EXPIRY_COOKIE, tokens.access_valid_until.toISOString(), {
      path: "/",
      expires: tokens.access_valid_until,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });
    
    // Create or update Redis session if user is provided
    if (user) {
      const sessionId = cookies.get(SESSION_ID_COOKIE) || null;
      if (sessionId) {
        // Update existing session
        await sessionManager.updateSession(sessionId, {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          accessExpiry: tokens.access_valid_until
        });
      } else {
        // Create new session
        const newSessionId = await sessionManager.createSession(user, {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          accessExpiry: tokens.access_valid_until
        });
        
        if (newSessionId) {
          cookies.set(SESSION_ID_COOKIE, newSessionId, {
            path: "/",
            expires: tokens.refresh_valid_until, // Same as refresh token
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
          });
        }
      }
    }
    cookies.set(REFRESH_TOKEN_COOKIE, encryptedRefreshToken, {
      path: "/",
      expires: tokens.refresh_valid_until,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });
  } catch (e) {
    logger.error("could not set cookies:" + e);
  }
}

export async function deleteCookies(cookies: Cookies) {
  try {
    // Delete session from Redis if exists
    const sessionId = cookies.get(SESSION_ID_COOKIE);
    if (sessionId) {
      await sessionManager.deleteSession(sessionId);
    }
    
    // Try to delete cookies, but catch errors if response has already been sent
    try {
      cookies.delete(ACCESS_TOKEN_COOKIE, { path: "/" });
    } catch (e) {
      console.warn("Could not delete access token cookie:", e.message);
    }
    
    try {
      cookies.delete(REFRESH_TOKEN_COOKIE, { path: "/" });
    } catch (e) {
      console.warn("Could not delete refresh token cookie:", e.message);
    }
    
    try {
      cookies.delete(ACCESS_EXPIRY_COOKIE, { path: "/" });
    } catch (e) {
      console.warn("Could not delete access expiry cookie:", e.message);
    }
    
    try {
      cookies.delete(SESSION_ID_COOKIE, { path: "/" });
    } catch (e) {
      console.warn("Could not delete session ID cookie:", e.message);
    }
  } catch (error) {
    logger.error("Error deleting cookies:", error);
  }
}

export function shouldRefreshToken(cookies: Cookies): boolean {
  const expiryStr = cookies.get(ACCESS_EXPIRY_COOKIE);
  if (!expiryStr) return true;
  
  try {
    const expiry = new Date(expiryStr);
    const now = new Date();
    const tokenLifetime = expiry.getTime() - now.getTime();
    const totalLifetime = 10 * 60 * 1000; // 10 minutes in ms
    
    // Refresh if we've used 80% of the token lifetime
    return tokenLifetime < (totalLifetime * (1 - TOKEN_REFRESH_THRESHOLD));
  } catch (e) {
    logger.error("Error parsing token expiry:", e);
    return true;
  }
}

export type Tokens = {
  access_token: string;
  refresh_token: string;
  access_valid_until: Date;
  refresh_valid_until: Date;
};
