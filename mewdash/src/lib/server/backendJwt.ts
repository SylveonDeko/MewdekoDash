import { createHmac, randomBytes } from "node:crypto";
import { env } from "$env/dynamic/private";
import { logger } from "$lib/logger";
import type { DiscordUser } from "$lib/types/discord";

/**
 * Shared HS256 secret between the dashboard and every bot instance. Must equal
 * each instance's `credentials.json` `JwtSecret`. The dashboard signs short-lived
 * backend tokens with it; the bot verifies them to learn which Discord user is
 * behind a proxied request.
 */
const BOT_JWT_SECRET = env.BOT_JWT_SECRET ?? "";

/**
 * Lifetime of a backend token in seconds. Kept short because the proxy mints a
 * fresh one per request; there is no refresh flow on this leg.
 */
const BACKEND_TTL = Number(env.BOT_JWT_TTL ?? 300);

/** Must match `DashJwtConstants.Issuer` on the bot. */
const ISSUER = "mewdeko-dashboard";
/** Must match `DashJwtConstants.Audience` on the bot. */
const AUDIENCE = "mewdeko-botapi";
/** Must match `DashJwtConstants.BackendScope` on the bot. */
const SCOPE = "botapi";

const b64url = (buf: Buffer | string) =>
  (Buffer.isBuffer(buf) ? buf : Buffer.from(buf))
    .toString("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

function hmac(payload: string): string {
  return b64url(createHmac("sha256", BOT_JWT_SECRET).update(payload).digest());
}

/**
 * Claims embedded in a backend token. `sub` is the Discord user id, `name` the
 * username; the bot records both in the dashboard audit log.
 */
interface BackendClaims {
  sub: string;
  name: string;
  jti: string;
  iat: number;
  exp: number;
  scope: typeof SCOPE;
  iss: typeof ISSUER;
  aud: typeof AUDIENCE;
}

/**
 * Mints a short-lived HS256 backend token identifying the given dashboard user.
 * Attached as `Authorization: Bearer` on proxied bot API calls so the bot can
 * verify the user instead of trusting a forwarded header.
 */
export function mintBackendToken(user: DiscordUser): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: BackendClaims = {
    sub: user.id.toString(),
    name: user.username,
    jti: b64url(randomBytes(12)),
    iat: now,
    exp: now + BACKEND_TTL,
    scope: SCOPE,
    iss: ISSUER,
    aud: AUDIENCE,
  };
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify(payload));
  const signature = hmac(`${header}.${body}`);
  return `${header}.${body}.${signature}`;
}

/**
 * Logs a warning at startup if `BOT_JWT_SECRET` is missing or weak. Without it
 * the bot rejects every dashboard token and audit logging loses the user
 * identity.
 */
export function logBackendJwtInit(): void {
  if (!BOT_JWT_SECRET || BOT_JWT_SECRET.length < 32) {
    logger.warn(
      "BOT_JWT_SECRET is missing or shorter than 32 bytes. It must match each bot instance's JwtSecret.",
    );
  }
}
