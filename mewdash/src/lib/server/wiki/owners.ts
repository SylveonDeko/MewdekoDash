import Redis from "ioredis";
import { env } from "$env/dynamic/private";
import { logger } from "$lib/logger";
import { apiKeyFor, defaultInstanceURL } from "$lib/server/instances";
import { mintBackendToken } from "$lib/server/backendJwt";
import { ownerStaleMs, parseAdminIds, planOwnerLookup, settleOwnerAnswer, type OwnerCacheEntry } from "$lib/wiki/permissions";
import type { DiscordUser } from "$lib/types/discord";

const memory = new Map<string, OwnerCacheEntry>();

let redis: Redis | null | undefined;

function redisClient(): Redis | null {
  if (redis !== undefined) return redis;
  redis = null;
  if (env.USE_REDIS !== "true" || !env.REDIS_URL) return redis;
  try {
    const client = new Redis(env.REDIS_URL, { lazyConnect: false, enableOfflineQueue: false, maxRetriesPerRequest: 1, commandTimeout: 1_000 });
    client.on("error", (error) => logger.warn("Wiki owner cache Redis error:", error.message));
    redis = client;
  } catch (error) {
    logger.warn("Wiki owner cache could not use Redis, keeping answers in memory:", error);
  }
  return redis;
}

function cacheKey(userId: string): string {
  return `${env.DISCORD_CLIENT_ID}_wiki_owner:${userId}`;
}

async function readCache(userId: string): Promise<OwnerCacheEntry | null> {
  const client = redisClient();
  if (client) {
    try {
      const raw = await client.get(cacheKey(userId));
      if (raw) {
        const parsed = JSON.parse(raw) as OwnerCacheEntry;
        if (typeof parsed.value === "boolean" && typeof parsed.at === "number") return parsed;
      }
    } catch {
      return memory.get(userId) ?? null;
    }
  }
  return memory.get(userId) ?? null;
}

async function writeCache(userId: string, entry: OwnerCacheEntry): Promise<void> {
  memory.set(userId, entry);
  const client = redisClient();
  if (!client) return;
  try {
    await client.set(cacheKey(userId), JSON.stringify(entry), "PX", ownerStaleMs);
  } catch {
    return;
  }
}

async function askBot(user: DiscordUser): Promise<boolean | null> {
  try {
    const base = await defaultInstanceURL();
    if (!base) return null;
    const headers: Record<string, string> = { "X-API-Key": apiKeyFor(base) };
    const token = mintBackendToken(user);
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const response = await fetch(`${base}/Ownership/${user.id.toString()}`, { headers, signal: AbortSignal.timeout(4_000) });
    if (!response.ok) return null;
    const text = (await response.text()).trim().toLowerCase();
    if (text === "true") return true;
    if (text === "false") return false;
    return null;
  } catch {
    return null;
  }
}

/**
 * Whether a signed in user is a bot owner, and so an admin of the wiki.
 *
 * Ids in `DASH_ADMIN_IDS` are always admins and never need the bot. Other answers come from the
 * bot's ownership API and are cached (Redis when the dashboard has it, memory otherwise). A
 * cached answer is used as is for five minutes. When the bot cannot be reached the last answer
 * is trusted for up to seven days.
 *
 * @param user The session user.
 */
export async function isWikiAdmin(user: DiscordUser): Promise<boolean> {
  const userId = user.id.toString();
  const now = Date.now();
  const cached = await readCache(userId);
  const plan = planOwnerLookup(userId, parseAdminIds(env.DASH_ADMIN_IDS), cached, now);
  if (plan.step === "env") return true;
  if (plan.step === "cached") return plan.value;

  const answer = await askBot(user);
  const settled = settleOwnerAnswer(answer, cached, now);
  if (settled.store) await writeCache(userId, { value: settled.value, at: now });
  return settled.value;
}
