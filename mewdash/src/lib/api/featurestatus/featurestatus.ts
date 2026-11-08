// lib/api/featurestatus/featurestatus.ts
import { apiRequest } from "../core";

/**
 * Whether a feature is switched on and whether it has been set up.
 */
export interface FeatureState {
  enabled: boolean;
  configured: boolean;
}

/**
 * Feature states keyed by the page slug in /dashboard/<slug>.
 */
export interface FeatureStatusResponse {
  features: Record<string, FeatureState>;
}

/**
 * Feature status API
 * Maps to Mewdeko.Controllers.FeatureStatusController
 */
export const featureStatusApi = {
  /**
   * Gets the enabled and configured state of every feature in a guild
   * @param guildId The guild ID
   */
  getFeatureStatus: (guildId: bigint | string) =>
    apiRequest<FeatureStatusResponse>(`FeatureStatus/${guildId}`),
};
