// lib/api/verification/verification.ts
import { apiRequest } from "../core";
import type {
  VerificationBulkResponse,
  VerificationPermissionChange,
  VerificationPermissionResult,
  VerificationSettings,
} from "./models";

/**
 * Verification API
 * Maps to Mewdeko.Controllers.VerificationController
 */
export const verificationApi = {
  /** Gets the verification settings */
  get: (guildId: bigint) => apiRequest<VerificationSettings>(`Verification/${guildId}`),

  /** Saves every setting at once and returns the saved state */
  update: (guildId: bigint, settings: VerificationSettings) =>
    apiRequest<VerificationSettings>(`Verification/${guildId}`, "POST", settings),

  /** Creates or uses a verification channel and posts the button in it */
  setup: (guildId: bigint, channelId: bigint | null) =>
    apiRequest<VerificationSettings>(`Verification/${guildId}/setup`, "POST", { channelId }),

  /** Posts the verification button again */
  postPanel: (guildId: bigint) => apiRequest<void>(`Verification/${guildId}/panel`, "POST"),

  /** Lists the channel overwrites the gate would change */
  previewPermissions: (guildId: bigint) =>
    apiRequest<VerificationPermissionChange[]>(`Verification/${guildId}/permissions`),

  /** Changes the channel overwrites the gate needs, remembering what they were */
  applyPermissions: (guildId: bigint) =>
    apiRequest<VerificationPermissionResult>(`Verification/${guildId}/permissions`, "POST"),

  /** Puts back the channel overwrites the gate changed */
  restorePermissions: (guildId: bigint) =>
    apiRequest<VerificationPermissionResult>(`Verification/${guildId}/permissions`, "DELETE"),

  /** Gets how many members a bulk verification would cover */
  countExisting: (guildId: bigint) =>
    apiRequest<VerificationBulkResponse>(`Verification/${guildId}/verify-existing`),

  /** Verifies the members already in the guild, in the background */
  verifyExisting: (guildId: bigint) =>
    apiRequest<VerificationBulkResponse>(`Verification/${guildId}/verify-existing`, "POST"),
};
