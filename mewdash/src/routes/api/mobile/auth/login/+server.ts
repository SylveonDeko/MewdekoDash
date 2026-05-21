import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import {
  DISCORD_API_URL,
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_SCOPES,
} from "$env/static/private";
import { logger } from "$lib/logger";
import { createSession } from "$lib/server/mobileJwt";
import { getUserData } from "../../../discord/discordAuth";

interface LoginBody {
  code?: string;
  codeVerifier?: string;
  redirectUri?: string;
}

/**
 * Exchanges a Discord OAuth2 authorization code (PKCE) for an app-issued
 * access JWT and opaque refresh token. The Discord access and refresh tokens
 * are retained server-side under a Redis-backed session handle and never
 * returned to the iOS client.
 *
 * Body: `{ code, codeVerifier, redirectUri }`.
 */
export const POST: RequestHandler = async ({ request }) => {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return json({ error: "invalid_body" }, { status: 400 });
  }

  const { code, codeVerifier, redirectUri } = body;
  if (!code || !codeVerifier || !redirectUri) {
    return json({ error: "missing_fields" }, { status: 400 });
  }

  const params = new URLSearchParams();
  params.append("client_id", DISCORD_CLIENT_ID);
  params.append("client_secret", DISCORD_CLIENT_SECRET);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", redirectUri);
  params.append("scope", DISCORD_SCOPES);
  params.append("code_verifier", codeVerifier);

  let tokenResponse: Response;
  try {
    tokenResponse = await fetch(`${DISCORD_API_URL}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });
  } catch (err) {
    logger.error("Discord token request failed", err);
    return json({ error: "discord_unreachable" }, { status: 502 });
  }

  if (!tokenResponse.ok) {
    const detail = await tokenResponse.text().catch(() => "");
    logger.warn(`Mobile login: Discord rejected code (${tokenResponse.status}): ${detail}`);
    return json({ error: "invalid_code" }, { status: 401 });
  }

  const tokenData = (await tokenResponse.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  let user;
  try {
    user = await getUserData(tokenData.access_token);
  } catch (err) {
    logger.error("Mobile login: failed to fetch /users/@me", err);
    return json({ error: "discord_user_lookup_failed" }, { status: 502 });
  }

  const session = await createSession(user, {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    accessExpiry: new Date(Date.now() + tokenData.expires_in * 1000),
  });

  return json({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    expiresIn: session.expiresIn,
    user: {
      id: user.id.toString(),
      username: user.username,
      globalName: user.display_name ?? user.username,
      avatar: user.avatar,
    },
  });
};
