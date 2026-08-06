import { env } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";
import { logger } from "$lib/logger";
import JSONbig from "json-bigint";

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
 * Returns the URL of the primary bot — the deployment whose database owns
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

  const response = await fetch(`${primary}/InstanceManagement`, {
    headers: { "X-API-Key": env.MEWDEKO_API_KEY },
  });
  if (!response.ok) {
    logger.warn(`Mobile instance discovery failed (${response.status}) at ${primary}`);
    throw new Error("primary_unreachable");
  }
  const raw = JSONbig.parse(await response.text()) as RawInstance[];
  cache = { fetchedAt: Date.now(), raw };
  return raw;
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
 * Resolves a mobile-supplied bot ID to the corresponding `botapi` URL.
 * Returns `null` if the ID is unknown or the instance is inactive — never
 * a client-controlled URL, so SSRF is impossible regardless of header
 * tampering.
 */
export async function resolveInstanceURL(botId: string): Promise<string | null> {
  const raw = await fetchInstances();
  const match = raw.find((i) => i.botId.toString() === botId && i.isActive);
  if (!match) return null;
  return instanceUrl(match);
}

/**
 * Resolves a browser-supplied instance port to the corresponding `botapi`
 * URL. Like {@link resolveInstanceURL} this only ever returns a URL built
 * from the registered instance list, so a tampered header cannot point the
 * proxy (which attaches the bot API key) at an arbitrary host.
 */
export async function resolveInstanceURLByPort(port: number): Promise<string | null> {
  const raw = await fetchInstances();
  const match = raw.find((i) => i.port === port && i.isActive);
  if (!match) return null;
  return instanceUrl(match);
}

/**
 * Picks the instance to route to when a mobile client did not supply an
 * `X-Mobile-Instance` header. Returns the singleton instance's URL when
 * exactly one is configured; otherwise returns `null` so the caller can
 * surface a "select an instance" error.
 */
export async function defaultInstanceURL(): Promise<string | null> {
  const raw = await fetchInstances();
  const active = raw.filter((i) => i.isActive);
  if (active.length === 1) return instanceUrl(active[0]);
  return primaryInstanceUrl();
}
