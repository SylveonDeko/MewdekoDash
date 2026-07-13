// lib/api/protection/protection.ts
import { apiRequest } from "../core";
import type {
  UpdateAntiPatternConfigRequest,
  AntiPatternPattern,
  AntiImageHashConfig,
  AddBannedImageHashRequest,
  BannedImageHash,
  ImageHashPreview,
} from "./models";
import type {
  ProtectionStatus,
  AntiRaidConfig,
  AntiSpamConfig,
  AntiAltConfig,
  AntiMassMentionConfig,
} from "../administration/models";

export const protectionApi = {
  getProtectionStatus: (guildId: bigint) =>
    apiRequest<ProtectionStatus>(`Protection/${guildId}/status`),

  configureAntiRaid: (guildId: bigint, config: AntiRaidConfig) =>
    apiRequest<{ success: boolean; settings?: any }>(
      `Protection/${guildId}/anti-raid`,
      "PUT",
      config,
    ),

  configureAntiSpam: (guildId: bigint, config: AntiSpamConfig) =>
    apiRequest<{ success: boolean }>(
      `Protection/${guildId}/anti-spam`,
      "PUT",
      config,
    ),

  toggleAntiSpamIgnoredChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<{ added: boolean }>(
      `Protection/${guildId}/anti-spam/ignored-channels/${channelId}`,
      "POST",
    ),

  configureAntiAlt: (guildId: bigint, config: AntiAltConfig) =>
    apiRequest<{ success: boolean }>(
      `Protection/${guildId}/anti-alt`,
      "PUT",
      config,
    ),

  configureAntiMassMention: (guildId: bigint, config: AntiMassMentionConfig) =>
    apiRequest<{ success: boolean }>(
      `Protection/${guildId}/anti-mass-mention`,
      "PUT",
      config,
    ),

  getProtectionStatistics: (guildId: bigint) =>
    apiRequest<any>(`Protection/${guildId}/statistics`),

  configureAntiPattern: (guildId: bigint, config: any) =>
    apiRequest<{ success: boolean; settings?: any }>(
      `Protection/${guildId}/anti-pattern`,
      "PUT",
      config,
    ),

  addAntiPatternPattern: (
    guildId: bigint,
    pattern: string,
    name: string,
    checkUsername: boolean,
    checkDisplayName: boolean,
  ) =>
    apiRequest<{ success: boolean }>(
      `Protection/${guildId}/anti-pattern/patterns`,
      "POST",
      {
        pattern,
        name,
        checkUsername,
        checkDisplayName,
      },
    ),

  removeAntiPatternPattern: (guildId: bigint, patternId: number) =>
    apiRequest<{ success: boolean }>(
      `Protection/${guildId}/anti-pattern/patterns/${patternId}`,
      "DELETE",
    ),

  updateAntiPatternConfig: (
    guildId: bigint,
    config: UpdateAntiPatternConfigRequest,
  ) =>
    apiRequest<{ success: boolean }>(
      `Protection/${guildId}/anti-pattern/config`,
      "PATCH",
      config,
    ),

  getAntiPatternPatterns: (guildId: bigint) =>
    apiRequest<AntiPatternPattern[]>(
      `Protection/${guildId}/anti-pattern/patterns`,
    ),

  configureAntiImageHash: (guildId: bigint, config: AntiImageHashConfig) =>
    apiRequest<{ success: boolean }>(
      `Protection/${guildId}/anti-image-hash`,
      "PUT",
      config,
    ),

  getBannedImageHashes: (guildId: bigint) =>
    apiRequest<BannedImageHash[]>(`Protection/${guildId}/anti-image-hash/hashes`),

  addBannedImageHash: (guildId: bigint, request: AddBannedImageHashRequest) =>
    apiRequest<BannedImageHash>(
      `Protection/${guildId}/anti-image-hash/hashes`,
      "POST",
      request,
    ),

  removeBannedImageHash: (guildId: bigint, hashId: number) =>
    apiRequest<{ success: boolean }>(
      `Protection/${guildId}/anti-image-hash/hashes/${hashId}`,
      "DELETE",
    ),

  /**
   * Hashes an image without blocking it, so the dashboard can preview the hash and its quality.
   * Accepts either an image URL or the base64 bytes of an uploaded file.
   */
  computeImageHash: (guildId: bigint, request: AddBannedImageHashRequest) =>
    apiRequest<ImageHashPreview>(
      `Protection/${guildId}/anti-image-hash/compute`,
      "POST",
      request,
    ),

  /**
   * Turns the bot's built-in list of known scam images on or off for the guild.
   */
  setPresetScamImages: (guildId: bigint, enabled: boolean) =>
    apiRequest<{ success: boolean; presetCount: number }>(
      `Protection/${guildId}/anti-image-hash/preset/${enabled}`,
      "POST",
    ),

  toggleAntiImageHashIgnoredRole: (guildId: bigint, roleId: bigint) =>
    apiRequest<{ added: boolean }>(
      `Protection/${guildId}/anti-image-hash/ignored-roles/${roleId}`,
      "POST",
    ),

  toggleAntiImageHashIgnoredChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<{ added: boolean }>(
      `Protection/${guildId}/anti-image-hash/ignored-channels/${channelId}`,
      "POST",
    ),
};
