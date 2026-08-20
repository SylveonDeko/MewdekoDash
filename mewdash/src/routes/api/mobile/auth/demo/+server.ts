import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { timingSafeEqual } from "node:crypto";
import { env } from "$env/dynamic/private";
import { createSession } from "$lib/server/mobileJwt";
import { defaultInstanceURL } from "$lib/server/instances";
import { logger } from "$lib/logger";
import type { DiscordUser } from "$lib/types/discord";

/** How long a redeemed demo session stays valid. */
const DEMO_TTL_SECONDS = 60 * 60 * 24 * 7;

/**
 * Extracts the avatar hash from a Discord CDN URL.
 *
 * @param url A rendered avatar URL, or null.
 * @returns The hash, or null for default avatars.
 */
function avatarHashFrom(url: string | null): string | null {
  if (!url) return null;
  const match = /\/avatars\/\d+\/([^./?]+)/.exec(url);
  return match?.[1] ?? null;
}

/**
 * Resolves the demo account's Discord username and avatar through the bot.
 *
 * @param userId The demo account's Discord id.
 * @returns The profile, or null when it cannot be resolved.
 */
async function lookupDemoProfile(
  userId: string,
): Promise<{ username: string; avatarUrl: string | null } | null> {
  const backend = await defaultInstanceURL();
  if (!backend) return null;
  const headers = { "X-API-Key": env.MEWDEKO_API_KEY };

  try {
    const guildsResponse = await fetch(
      `${backend}/botapi/ClientOperations/mutualguilds/${userId}`,
      { headers },
    );
    if (!guildsResponse.ok) return null;
    const guilds = (await guildsResponse.json()) as Array<{ id?: string | number }>;
    const guildId = guilds?.[0]?.id;
    if (guildId === undefined) return null;

    const userResponse = await fetch(
      `${backend}/botapi/ClientOperations/user/${guildId}/${userId}`,
      { headers },
    );
    if (!userResponse.ok) return null;
    const profile = (await userResponse.json()) as {
      username?: string;
      avatarUrl?: string | null;
    };
    if (!profile.username) return null;
    return { username: profile.username, avatarUrl: profile.avatarUrl ?? null };
  } catch (err) {
    logger.warn("Mobile demo: could not resolve the demo profile", err);
    return null;
  }
}

/**
 * Compares two secrets in constant time.
 *
 * @returns Whether the values are identical.
 */
function secretMatches(supplied: string, expected: string): boolean {
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Redeems a demo code for a read-only mobile session.
 *
 * Responds 404 unless both `MOBILE_DEMO_CODE` and `MOBILE_DEMO_USER_ID` are
 * configured.
 *
 * Body: `{ code }`.
 *
 * @returns An access token, refresh token, and the demo account's profile.
 */
export const POST: RequestHandler = async ({ request }) => {
  const expected = env.MOBILE_DEMO_CODE;
  const demoUserId = env.MOBILE_DEMO_USER_ID;
  if (!expected || !demoUserId) {
    return json({ error: "not_found" }, { status: 404 });
  }

  let body: { code?: string };
  try {
    body = (await request.json()) as { code?: string };
  } catch {
    return json({ error: "invalid_body" }, { status: 400 });
  }

  if (!body.code || !secretMatches(body.code, expected)) {
    logger.warn("Mobile demo: rejected code redemption");
    return json({ error: "invalid_code" }, { status: 401 });
  }

  const profile = await lookupDemoProfile(demoUserId);
  const displayName = profile?.username ?? env.MOBILE_DEMO_USERNAME ?? "Demo";

  const user = {
    id: demoUserId,
    username: displayName,
    display_name: displayName,
    discriminator: "0",
    avatar: avatarHashFrom(profile?.avatarUrl ?? null) ?? "",
    email: "",
    verified: true,
    flags: 0,
    premium_type: 0,
    public_flags: 0,
    mfa_enabled: false,
    locale: "en-US",
    accent_color: "",
    banner_color: "",
    banner: "",
    avatar_decoration: "",
  } as unknown as DiscordUser;

  const session = await createSession(
    user,
    { accessToken: "", refreshToken: "", accessExpiry: new Date(0) },
    { demo: true, ttlSeconds: DEMO_TTL_SECONDS },
  );

  logger.info("Mobile demo: minted a read-only session");

  return json({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    expiresIn: session.expiresIn,
    user: {
      id: user.id.toString(),
      username: user.username,
      globalName: user.display_name,
      avatar: avatarHashFrom(profile?.avatarUrl ?? null),
    },
  });
};
