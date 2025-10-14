// lib/api/wizard/wizard.ts
import { apiRequest } from "../core";
import type {
  WizardCompleteResponse,
  WizardDecisionResponse,
  WizardStateResponse,
  WizardStateUpdateRequest
} from "./models";

/**
 * Wizard/Setup API
 * Maps to Mewdeko.Controllers.WizardController
 */
export const wizardApi = {
  /**
   * Determines whether to show wizard for user and guild
   * @param userId The user ID
   * @param guildId The guild ID
   * @returns Wizard decision
   */
  shouldShowWizard: (userId: bigint, guildId: bigint) =>
    apiRequest<WizardDecisionResponse>(
      `Wizard/should-show/${userId}/${guildId}`,
    ),

  /**
   * Gets current wizard state for a guild
   * @param guildId The guild ID
   * @returns Wizard state
   */
  getWizardState: (guildId: bigint) =>
    apiRequest<WizardStateResponse>(`Wizard/state/${guildId}`),

  /**
   * Updates wizard state for a guild
   * @param guildId The guild ID
   * @param request State update request
   */
  updateWizardState: (guildId: bigint, request: WizardStateUpdateRequest) =>
    apiRequest<void>(`Wizard/state/${guildId}`, "POST", request),

  /**
   * Completes the wizard setup
   * @param userId The user ID
   * @param guildId The guild ID
   * @param configuredFeatures Array of configured feature IDs
   * @returns Completion result
   */
  completeWizard: (
    userId: bigint,
    guildId: bigint,
    configuredFeatures: string[],
  ) =>
    apiRequest<WizardCompleteResponse>(
      `Wizard/complete/${userId}/${guildId}`,
      "POST",
      configuredFeatures,
    ),

  /**
   * Skips the wizard for a guild
   * @param guildId The guild ID
   * @param userId User ID who is skipping
   */
  skipWizard: (guildId: bigint, userId: bigint) =>
    apiRequest<void>(`Wizard/skip/${guildId}`, "POST", userId),

  /**
   * Checks bot permissions in a guild
   * @param guildId The guild ID
   * @returns Permission check results
   */
  checkBotPermissions: (guildId: bigint) =>
    apiRequest<any>(`Wizard/permissions/${guildId}`),
};
