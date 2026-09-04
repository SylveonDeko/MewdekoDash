import { env } from "$env/dynamic/private";
import JSONbig from "json-bigint";
import { logger } from "$lib/logger";
import { defaultInstanceURL, resolveInstanceURL } from "$lib/server/instances";
import { mintBackendToken } from "$lib/server/backendJwt";
import type { LayoutServerLoad } from "./$types";

/**
 * Resolves which bot instance to ask, preferring the one the browser last selected.
 * The bot ID comes from a cookie the client mirrors its stored selection into, and is
 * only ever matched against the registered instance list, never used to build a URL,
 * so a tampered cookie can at most name another registered instance. It cannot aim
 * the key-bearing request at an arbitrary host, and the guild query it feeds is
 * scoped to the requesting user either way.
 */
async function resolveInstance(botId: string | undefined): Promise<string | null> {
  if (botId && /^\d{1,20}$/.test(botId)) {
    const url = await resolveInstanceURL(botId);
    if (url) return url;
  }

  return defaultInstanceURL();
}

/**
 * Fetches the guilds the user can manage during SSR, so the dashboard renders its
 * server list without waiting for the browser to boot and make the round trip
 * itself. Failure is not fatal: the client fetches the list on mount regardless,
 * and this only removes the wait when it works.
 */
async function loadGuilds(user: App.Locals["user"], botId: string | undefined) {
  if (!user) return null;

  try {
    const instanceUrl = await resolveInstance(botId);
    if (!instanceUrl) return null;

    const headers: Record<string, string> = { "X-API-Key": env.MEWDEKO_API_KEY };
    const token = mintBackendToken(user);
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(
      `${instanceUrl}/ClientOperations/mutualguilds/${user.id}?adminOnly=true`,
      { headers }
    );
    if (!response.ok) return null;

    const text = await response.text();
    return text ? JSONbig.parse(text) : null;
  } catch (err) {
    logger.debug("SSR guild prefetch failed, client will fetch instead", err);
    return null;
  }
}

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
  const user = locals.user || null;
  const guilds = await loadGuilds(user, cookies.get("selectedInstanceId"));

  return {
    // Always allow access - let client-side handle authentication with user store
    user,
    guilds: guilds ? JSONbig.stringify(guilds) : null
  };
};
