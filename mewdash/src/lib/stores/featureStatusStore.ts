import { writable } from "svelte/store";
import { featureStatusApi, type FeatureState } from "$lib/api/featurestatus/featurestatus";

/**
 * Feature states for the selected guild keyed by page slug, or null when they are unknown or the request failed.
 */
export const featureStatus = writable<Record<string, FeatureState> | null>(null);

let latestGuildId: string | null = null;

/**
 * Loads the feature states for a guild.
 */
export async function loadFeatureStatus(guildId: bigint | string | null | undefined) {
  latestGuildId = guildId ? guildId.toString() : null;
  featureStatus.set(null);
  if (!latestGuildId) return;

  const requested = latestGuildId;
  try {
    const response = await featureStatusApi.getFeatureStatus(requested);
    if (requested === latestGuildId) featureStatus.set(response?.features ?? null);
  } catch {
    if (requested === latestGuildId) featureStatus.set(null);
  }
}

/**
 * The slug a dashboard href is stored under in the feature states.
 */
export function featureSlug(href: string): string {
  return href.replace(/^\/dashboard\//, "");
}
