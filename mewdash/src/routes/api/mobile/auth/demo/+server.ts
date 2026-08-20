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
 * Pulls the avatar hash out of a Discord CDN URL.
 *
 * The bot hands back a rendered URL, but the app builds its own from the hash,
 * so only the hash travels. Default avatars carry no hash and yield null.
 */
function avatarHashFrom(url: string | null): string | null {
  if (!url) return null;
  const match = /\/avatars\/\d+\/([^./?]+)/.exec(url);
  return match?.[1] ?? null;
}

/**
 * Looks up the demo account's real Discord profile through the bot.
 *
 * The dashboard holds no bot token, so it cannot query Discord directly. The
 * bot can, but only for a guild it shares with the user, so this resolves a
 * mutual guild first. Returns null if anything is unavailable, leaving the
 * caller to fall back to a placeholder name.
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
 * Compares two secrets without leaking their common prefix through timing.
 * Lengths are compared first because `timingSafeEqual` throws on a mismatch.
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
 * This exists so app store reviewers can see the app without a Discord login:
 * an OAuth round trip from a reviewer's network reliably triggers Discord's
 * new-location verification, which they cannot clear. The code is bound to a
 * pre-existing Discord identity that is already a member of a guild the bot is
 * in, so no account credentials are ever shared.
 *
 * Disabled unless both `MOBILE_DEMO_CODE` and `MOBILE_DEMO_USER_ID` are set,
 * so a selfhosted dashboard never exposes it by accident.
 *
 * Body: `{ code }`. Returns the same shape as `/api/mobile/auth/login`.
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
    id: BigInt(demoUserId),
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
  } as DiscordUser;

  /*
   * The Discord token fields stay empty: the mobile API path authorises from
   * the session's user id and the server-side API key, and refresh rotates
   * off its own Redis record, so neither reads these.
   */
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
