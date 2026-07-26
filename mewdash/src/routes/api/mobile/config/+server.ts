import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { env } from "$env/dynamic/private";

const DEFAULT_MOBILE_REDIRECT_URI = "mewdeko-mobile://oauth/callback";

/**
 * Public discovery endpoint for the iOS app. The app stores a user-supplied
 * dashboard URL (selfhosters point at their own deployment) and hits this
 * endpoint to learn the Discord OAuth parameters that selfhoster has
 * configured. No auth required.
 *
 * Selfhosters must register `MOBILE_OAUTH_REDIRECT_URI` (default
 * `mewdeko-mobile://oauth/callback`) as an allowed redirect on their
 * Discord application.
 */
export const GET: RequestHandler = async () => {
  return json({
    discord: {
      clientId: env.DISCORD_CLIENT_ID,
      redirectUri: env.MOBILE_OAUTH_REDIRECT_URI ?? DEFAULT_MOBILE_REDIRECT_URI,
      scopes: env.DISCORD_SCOPES,
      authorizeUrl: "https://discord.com/api/oauth2/authorize",
    },
    instance: {
      name: env.PUBLIC_INSTANCE_NAME ?? "Mewdeko",
      inviteUrl: env.PUBLIC_BOT_INVITE_URL ?? null,
    },
    api: {
      version: 1,
    },
  });
};
