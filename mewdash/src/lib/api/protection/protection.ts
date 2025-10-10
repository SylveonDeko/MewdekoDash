// lib/api/protection/protection.ts
import { apiRequest } from "../core";
import type {
  AddPatternRequest,
  UpdateAntiPatternConfigRequest,
  AntiPatternPattern,
} from "./models";
import type {
  ProtectionStatus,
  AntiRaidConfig,
  AntiSpamConfig,
  AntiAltConfig,
  AntiMassMentionConfig,
  AntiPatternConfigRequest,
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
      } as AddPatternRequest,
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
};
