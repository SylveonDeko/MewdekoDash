import type { PageServerLoad } from "./$types";
import type { BotStatus } from "$lib/api";
import Redis from "ioredis";
import { env } from "$env/dynamic/private";
import { logger } from "$lib/logger";
import { botApiGet, defaultInstanceURL } from "$lib/server/instances";
import { siteStats, type SiteStats } from "$lib/config/siteStats";

const CACHE_TTL_SECONDS = 600;
const redis = env.USE_REDIS === "true" ? new Redis(env.REDIS_URL) : null;
let memoryCache: { at: number; stats: SiteStats } | null = null;

async function fetchStats(): Promise<SiteStats> {
  const base = await defaultInstanceURL();
  if (!base) return siteStats;
  const [status, guilds] = await Promise.all([
    botApiGet<BotStatus>(base, "BotStatus"),
    botApiGet<string>(base, "BotStatus/guilds"),
  ]);
  let servers = 0;
  try {
    servers = guilds ? (JSON.parse(guilds) as unknown[]).length : 0;
  } catch {
    servers = 0;
  }
  return {
    commands: status?.commandsCount || siteStats.commands,
    modules: status?.modulesCount || siteStats.modules,
    servers: servers || siteStats.servers,
  };
}

async function cachedStats(): Promise<SiteStats> {
  const key = `${env.DISCORD_CLIENT_ID}_sitestats`;
  if (redis) {
    try {
      const hit = await redis.get(key);
      if (hit) return JSON.parse(hit) as SiteStats;
      const stats = await fetchStats();
      await redis.setex(key, CACHE_TTL_SECONDS, JSON.stringify(stats));
      return stats;
    } catch (err) {
      logger.error("Redis error:", err);
    }
  }
  if (!memoryCache || Date.now() - memoryCache.at > CACHE_TTL_SECONDS * 1000) {
    memoryCache = { at: Date.now(), stats: await fetchStats() };
  }
  return memoryCache.stats;
}

export const load: PageServerLoad = async () => ({ stats: await cachedStats() });
