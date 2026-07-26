import { createHmac, randomBytes } from "node:crypto";
import Redis from "ioredis";
import { env } from "$env/dynamic/private";
import { logger } from "$lib/logger";
import type { DiscordUser } from "$lib/types/discord";

const ACCESS_TTL = Number(env.MOBILE_ACCESS_TOKEN_TTL ?? 900);
const REFRESH_TTL = Number(env.MOBILE_REFRESH_TOKEN_TTL ?? 60 * 60 * 24 * 30);
const REUSE_GRACE = 5;
const MOBILE_JWT_SECRET = env.MOBILE_JWT_SECRET ?? "";

let redis: Redis | null = null;
function getRedis(): Redis {
  if (env.USE_REDIS !== "true") throw new Error("Mobile auth requires USE_REDIS=true");
  if (!redis) redis = new Redis(env.REDIS_URL);
  return redis;
}

const b64url = (buf: Buffer | string) =>
  (Buffer.isBuffer(buf) ? buf : Buffer.from(buf))
    .toString("base64")
    .replaceAll("=", "")
    .replaceAll("+", "-")
    .replaceAll("/", "_");

const b64urlDecode = (s: string) =>
  Buffer.from(s.replaceAll("-", "+").replaceAll("_", "/"), "base64");

function hmac(payload: string): string {
  return b64url(createHmac("sha256", MOBILE_JWT_SECRET).update(payload).digest());
}

/**
 * Claims embedded in a mobile access JWT. `sid` is the handle into Redis
 * where the per-user Discord OAuth tokens live; the iOS client never sees them.
 */
export interface AccessClaims {
  sub: string;
  jti: string;
  iat: number;
  exp: number;
  scope: "mobile";
  sid: string;
}

/**
 * Mints a signed HS256 access token from the given non-time claims.
 * Adds `iat`, `exp`, and `scope: "mobile"`.
 */
export function mintAccessToken(claims: Omit<AccessClaims, "iat" | "exp" | "scope">): {
  token: string;
  expiresIn: number;
  expiresAt: number;
} {
  const now = Math.floor(Date.now() / 1000);
  const payload: AccessClaims = {
    ...claims,
    iat: now,
    exp: now + ACCESS_TTL,
    scope: "mobile",
  };
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify(payload));
  const signature = hmac(`${header}.${body}`);
  return {
    token: `${header}.${body}.${signature}`,
    expiresIn: ACCESS_TTL,
    expiresAt: payload.exp,
  };
}

/**
 * Verifies signature and expiry of a mobile access JWT.
 * Returns the decoded claims on success, `null` on any failure.
 */
export function verifyAccessToken(token: string): AccessClaims | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  if (hmac(`${header}.${body}`) !== signature) return null;
  let claims: AccessClaims;
  try {
    claims = JSON.parse(b64urlDecode(body).toString("utf8"));
  } catch {
    return null;
  }
  if (claims.scope !== "mobile") return null;
  if (claims.exp < Math.floor(Date.now() / 1000)) return null;
  return claims;
}

const sessionKey = (sid: string) => `${env.DISCORD_CLIENT_ID}_mobile_session:${sid}`;
const refreshKey = (jti: string) => `${env.DISCORD_CLIENT_ID}_mobile_refresh:${jti}`;
const familyKey = (fid: string) => `${env.DISCORD_CLIENT_ID}_mobile_family:${fid}`;

/**
 * Server-only mobile session record. Holds the user's Discord OAuth tokens
 * so the dashboard can act on the user's behalf when proxying bot API calls.
 */
export interface MobileSessionData {
  user: DiscordUser;
  discord: {
    accessToken: string;
    refreshToken: string;
    accessExpiry: string;
  };
  createdAt: string;
}

/**
 * Creates a mobile session for the given user and mints the initial
 * access/refresh token pair. Stores Discord OAuth tokens in Redis under
 * a server-only handle.
 */
export async function createSession(
  user: DiscordUser,
  discord: { accessToken: string; refreshToken: string; accessExpiry: Date },
): Promise<{ sid: string; refreshToken: string; accessToken: string; expiresIn: number }> {
  const r = getRedis();
  const sid = b64url(randomBytes(24));
  const family = b64url(randomBytes(16));
  const session: MobileSessionData = {
    user,
    discord: {
      accessToken: discord.accessToken,
      refreshToken: discord.refreshToken,
      accessExpiry: discord.accessExpiry.toISOString(),
    },
    createdAt: new Date().toISOString(),
  };
  await r.setex(sessionKey(sid), REFRESH_TTL, JSON.stringify(session));

  const userId = user.id.toString();
  const refresh = await issueRefreshToken({ sid, family, userId });
  const access = mintAccessToken({ sub: userId, jti: b64url(randomBytes(12)), sid });
  return {
    sid,
    refreshToken: refresh,
    accessToken: access.token,
    expiresIn: access.expiresIn,
  };
}

/**
 * Loads a mobile session by `sid`. Returns `null` if it has expired or never existed.
 */
export async function getSession(sid: string): Promise<MobileSessionData | null> {
  const r = getRedis();
  const data = await r.get(sessionKey(sid));
  if (!data) return null;
  try { return JSON.parse(data); } catch { return null; }
}

/**
 * Replaces the Discord OAuth tokens stored on a session. Used after the
 * dashboard refreshes the upstream Discord access token.
 */
export async function updateSessionDiscordTokens(
  sid: string,
  discord: { accessToken: string; refreshToken: string; accessExpiry: Date },
): Promise<void> {
  const r = getRedis();
  const existing = await getSession(sid);
  if (!existing) return;
  existing.discord = {
    accessToken: discord.accessToken,
    refreshToken: discord.refreshToken,
    accessExpiry: discord.accessExpiry.toISOString(),
  };
  await r.setex(sessionKey(sid), REFRESH_TTL, JSON.stringify(existing));
}

interface RefreshRecord {
  sid: string;
  family: string;
  userId: string;
  createdAt: number;
  used: boolean;
}

async function issueRefreshToken(args: {
  sid: string;
  family: string;
  userId: string;
}): Promise<string> {
  const r = getRedis();
  const jti = b64url(randomBytes(24));
  const record: RefreshRecord = {
    ...args,
    createdAt: Date.now(),
    used: false,
  };
  await r.setex(refreshKey(jti), REFRESH_TTL, JSON.stringify(record));
  await r.sadd(familyKey(args.family), jti);
  await r.expire(familyKey(args.family), REFRESH_TTL);
  return `${jti}.${b64url(randomBytes(16))}`;
}

/**
 * Rotates a single-use refresh token: marks it used, issues a fresh pair,
 * and detects replay by burning the entire token family on reuse.
 * A short reuse-grace window allows flaky-network retries to succeed.
 */
export async function rotateRefreshToken(opaque: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
} | { error: "invalid" | "reused" | "expired" }> {
  const r = getRedis();
  const [jti] = opaque.split(".");
  if (!jti) return { error: "invalid" };

  const raw = await r.get(refreshKey(jti));
  if (!raw) return { error: "expired" };
  let record: RefreshRecord;
  try { record = JSON.parse(raw); } catch { return { error: "invalid" }; }

  if (record.used) {
    await revokeFamily(record.family);
    return { error: "reused" };
  }

  record.used = true;
  await r.setex(refreshKey(jti), REUSE_GRACE, JSON.stringify(record));

  const next = await issueRefreshToken({
    sid: record.sid,
    family: record.family,
    userId: record.userId,
  });
  const access = mintAccessToken({
    sub: record.userId,
    jti: b64url(randomBytes(12)),
    sid: record.sid,
  });
  return {
    accessToken: access.token,
    refreshToken: next,
    expiresIn: access.expiresIn,
  };
}

/**
 * Revokes the entire refresh-token family that the given opaque token
 * belongs to. Idempotent.
 */
export async function revokeRefreshToken(opaque: string): Promise<void> {
  const r = getRedis();
  const [jti] = opaque.split(".");
  if (!jti) return;
  const raw = await r.get(refreshKey(jti));
  if (!raw) return;
  try {
    const record: RefreshRecord = JSON.parse(raw);
    await revokeFamily(record.family);
  } catch {
    await r.del(refreshKey(jti));
  }
}

/**
 * Deletes every refresh token in a family and the family index itself.
 */
export async function revokeFamily(family: string): Promise<void> {
  const r = getRedis();
  const members = await r.smembers(familyKey(family));
  if (members.length) await r.del(...members.map(refreshKey));
  await r.del(familyKey(family));
}

/**
 * Drops the server-side mobile session record. Subsequent requests carrying
 * an access token whose `sid` points here will fail to resolve a Discord
 * token and be rejected by the proxy.
 */
export async function revokeSession(sid: string): Promise<void> {
  const r = getRedis();
  await r.del(sessionKey(sid));
}

/**
 * Logs a warning at startup if `MOBILE_JWT_SECRET` looks weak.
 */
export function logMobileAuthInit(): void {
  if (!MOBILE_JWT_SECRET || MOBILE_JWT_SECRET.length < 32) {
    logger.warn("MOBILE_JWT_SECRET is missing or shorter than 32 bytes — set a strong secret");
  }
}
