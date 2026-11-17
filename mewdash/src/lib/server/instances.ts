import { env } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";
import { logger } from "$lib/logger";
import JSONbig from "json-bigint";
import { mintBackendToken } from "$lib/server/backendJwt";
import type { DiscordUser } from "$lib/types/discord";

const CACHE_TTL_MS = 15_000;

interface RawInstance {
  id: number;
  botName: string;
  botAvatar: string;
  botId: number | bigint | string;
  isActive: boolean;
  port: number;
  /** Hostname the instance's API is reachable on. Absent on pre-184 bot versions. */
  host?: string | null;
}

/**
 * A bot instance as exposed to mobile clients. Snowflake-shaped IDs are
 * stringified to avoid JSON precision loss; the local-port URL is kept
 * server-side and never returned.
 */
export interface MobileInstance {
  botId: string;
  botName: string;
  botAvatar: string | null;
  isActive: boolean;
}

interface CachedInstances {
  fetchedAt: number;
  raw: RawInstance[];
}

let cache: CachedInstances | null = null;

/**
 * Returns the URL of the primary bot: the deployment whose database owns
 * the instance list and acts as the seed for instance discovery. This is
 * the same `PUBLIC_MEWDEKO_API_URL` the dashboard already uses as its
 * default backend.
 */
function primaryInstanceUrl(): string | null {
  return publicEnv.PUBLIC_MEWDEKO_API_URL?.length ? publicEnv.PUBLIC_MEWDEKO_API_URL : null;
}

/**
 * Builds the `botapi` URL for an instance. The host comes from the bot's own
 * registration, so it is correct whether the bot shares a machine with the
 * dashboard or runs in a separate container. Bots that predate host tracking
 * report no host, and keep the historical localhost behaviour.
 */
function instanceUrl(instance: RawInstance): string {
  const host = instance.host?.trim().length ? instance.host.trim() : "localhost";
  return `http://${host}:${instance.port}/botapi`;
}

/**
 * Fetches the configured bot instances from the primary deployment.
 * Caches the result for ``CACHE_TTL_MS`` to avoid hammering the bot when
 * many mobile clients are active.
 */
async function fetchInstances(): Promise<RawInstance[]> {
  const primary = primaryInstanceUrl();
  if (!primary) throw new Error("primary_instance_not_configured");

  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.raw;
  }

  inflight ??= (async () => {
    try {
      const response = await fetch(`${primary}/InstanceManagement`, {
        headers: { "X-API-Key": env.MEWDEKO_API_KEY },
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) throw new Error(`status ${response.status}`);
      const raw = JSONbig.parse(await response.text()) as RawInstance[];
      await refreshInstanceKeys(primary, raw);
      cache = { fetchedAt: Date.now(), raw };
      return raw;
    } catch (err) {
      logger.warn(`Mobile instance discovery failed at ${primary}`, err);
      if (cache) return cache.raw;
      throw new Error("primary_unreachable");
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

let inflight: Promise<RawInstance[]> | null = null;

let keysByBase = new Map<string, string>();

async function refreshInstanceKeys(primary: string, raw: RawInstance[]): Promise<void> {
  try {
    const response = await fetch(`${primary}/InstanceManagement/keys`, {
      headers: { "X-API-Key": env.MEWDEKO_API_KEY, "X-Key-Exchange": "1" },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`status ${response.status}`);
    const keys = JSON.parse(await response.text()) as Record<string, string>;
    const next = new Map<string, string>();
    for (const instance of raw) {
      const key = keys[String(instance.port)];
      if (key) next.set(instanceUrl(instance), key);
    }
    keysByBase = next;
  } catch (err) {
    logger.warn("Per-instance API keys could not be loaded, keeping the last known keys", err);
  }
}

export function apiKeyFor(base: string): string {
  return keysByBase.get(base) ?? env.MEWDEKO_API_KEY;
}

/**
 * Sanitised list of instances safe to return to authenticated mobile
 * clients.
 */
export async function listMobileInstances(): Promise<MobileInstance[]> {
  const raw = await fetchInstances();
  return raw
    .filter((i) => i.isActive)
    .map((i) => ({
      botId: i.botId.toString(),
      botName: i.botName,
      botAvatar: i.botAvatar || null,
      isActive: i.isActive,
    }));
}

/**
 * Narrows a list of instances to those the user can administer.
 *
 * An instance qualifies when the user shares at least one guild with that bot
 * and holds admin or explicit dashboard access there. Unreachable instances
 * are dropped.
 *
 * @param instances The instances to consider.
 * @param user The Discord user whose access is being resolved.
 * @returns The subset the user can administer.
 */
export async function filterInstancesForUser(
  instances: MobileInstance[],
  user: DiscordUser,
): Promise<MobileInstance[]> {
  const raw = await fetchInstances();
  const userId = user.id.toString();
  const backendToken = mintBackendToken(user);
  if (!backendToken) return [];
  const checks = await Promise.all(
    instances.map(async (instance) => {
      const match = raw.find((i) => i.botId.toString() === instance.botId);
      if (!match) return null;
      try {
        const response = await fetch(
          `${instanceUrl(match)}/ClientOperations/mutualguilds/${userId}?adminOnly=true`,
          {
            headers: {
              "X-API-Key": apiKeyFor(instanceUrl(match)),
              Authorization: `Bearer ${backendToken}`,
            },
          },
        );
        if (!response.ok) {
          logger.warn(
            `Instance ${instance.botName} rejected a mutual-guild lookup: ${response.status}`,
          );
          return null;
        }
        const guilds = (await response.json()) as unknown[];
        return Array.isArray(guilds) && guilds.length > 0 ? instance : null;
      } catch (err) {
        logger.warn(`Instance ${instance.botName} was unreachable`, err);
        return null;
      }
    }),
  );
  return checks.filter((i): i is MobileInstance => i !== null);
}

/**
 * Resolves a mobile-supplied bot ID to the corresponding `botapi` URL.
 * Returns `null` if the ID is unknown or the instance is inactive: never
 * a client-controlled URL, so SSRF is impossible regardless of header
 * tampering.
 */
export async function resolveInstanceURL(botId: string): Promise<string | null> {
  const match = await findActiveInstance((i) => i.botId.toString() === botId);
  return match ? instanceUrl(match) : null;
}

/** Finds an active instance, refetching the list once on a miss. */
async function findActiveInstance(predicate: (instance: RawInstance) => boolean): Promise<RawInstance | null> {
  try {
    const match = (await fetchInstances()).find((i) => predicate(i) && i.isActive);
    if (match) return match;
    cache = null;
    return (await fetchInstances()).find((i) => predicate(i) && i.isActive) ?? null;
  } catch {
    return null;
  }
}

/**
 * Resolves a browser-supplied instance port to the corresponding `botapi`
 * URL. Like {@link resolveInstanceURL} this only ever returns a URL built
 * from the registered instance list, so a tampered header cannot point the
 * proxy (which attaches the bot API key) at an arbitrary host.
 */
export async function resolveInstanceURLByPort(port: number): Promise<string | null> {
  const match = await findActiveInstance((i) => i.port === port);
  return match ? instanceUrl(match) : null;
}

/**
 * Picks the instance to route to when a mobile client did not supply an
 * `X-Mobile-Instance` header. Returns the singleton instance's URL when
 * exactly one is configured; otherwise returns `null` so the caller can
 * surface a "select an instance" error.
 */
export async function defaultInstanceURL(): Promise<string | null> {
  try {
    const active = (await fetchInstances()).filter((i) => i.isActive);
    if (active.length === 1) return instanceUrl(active[0]);
  } catch {}
  return primaryInstanceUrl();
}

/**
 * Performs a keyed GET against a bot API. Snowflakes are kept as strings.
 * Returns `null` on a non-ok response, a timeout or any other failure.
 */
export async function botApiGet<T>(base: string, path: string): Promise<T | null> {
  try {
    const response = await fetch(`${base}/${path}`, {
      headers: { "X-API-Key": apiKeyFor(base) },
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return null;
    return JSONbig({ storeAsString: true }).parse(await response.text()) as T;
  } catch {
    return null;
  }
}

/**
 * Finds the first active instance whose bot is in the given guild.
 * Returns its `botapi` URL and the guild summary, or `null` when none has it.
 */
export async function findInstanceWithGuild(
  guildId: string,
): Promise<{ base: string; guild: { guildName?: string; iconUrl?: string } } | null> {
  let raw: RawInstance[];
  try {
    raw = await fetchInstances();
  } catch {
    return null;
  }
  const results = await Promise.all(
    raw
      .filter((i) => i.isActive)
      .map(async (instance) => {
        const base = instanceUrl(instance);
        const guild = await botApiGet<{ hasGuild?: boolean; guildName?: string; iconUrl?: string }>(
          base,
          `ClientOperations/hasguild/${guildId}`,
        );
        return guild?.hasGuild ? { base, guild } : null;
      }),
  );
  return results.find((r) => r !== null) ?? null;
}
