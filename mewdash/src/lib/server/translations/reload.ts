import { logger } from "$lib/logger";
import { sessionManager } from "$lib/server/redisSession";

/** The Redis channel the bots listen on for translation changes. */
export const reloadChannel = "mewdeko:translations:reload";

/** The message published for a change to the `bot` catalog. */
export const reloadMessage = "bot";

const publishTimeoutMs = 2_000;

type Publisher = (channel: string, message: string) => Promise<boolean>;

let publisher: Publisher = (channel, message) => sessionManager.publish(channel, message);

/** Replaces the publisher. The tests use it to see what would be sent. */
export function setReloadPublisher(replacement: Publisher | null): void {
  publisher = replacement ?? ((channel, message) => sessionManager.publish(channel, message));
}

/**
 * Tells the bots to reload after an override of `catalog` changed. Only the `bot` catalog has
 * anything to tell. It is best effort: it waits at most two seconds and never throws.
 *
 * @param catalog The catalog whose overrides changed.
 */
export async function notifyReload(catalog: string): Promise<void> {
  if (catalog !== "bot") return;
  try {
    await Promise.race([
      publisher(reloadChannel, reloadMessage),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), publishTimeoutMs).unref()),
    ]);
  } catch (error) {
    logger.warn("Could not publish the translation reload:", error);
  }
}
