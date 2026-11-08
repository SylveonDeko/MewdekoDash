// lib/api/customvoice/customvoice.ts
import { apiRequest } from "../core";
import type {
  CustomVoiceConfigurationResponse,
  CustomVoiceConfigurationRequest,
  CustomVoiceChannelResponse,
  UpdateCustomVoiceChannelRequest,
  CustomVoiceUserPreference,
} from "./models";

const hubQuery = (hub?: bigint | string | null) => (hub ? `?hub=${hub}` : "");

export const customVoiceApi = {
  getCustomVoiceConfig: (guildId: bigint) =>
    apiRequest<CustomVoiceConfigurationResponse>(
      `customvoice/${guildId}/configuration`,
    ),

  getCustomVoiceHubs: (guildId: bigint) =>
    apiRequest<CustomVoiceConfigurationResponse[]>(
      `customvoice/${guildId}/hubs`,
    ),

  updateCustomVoiceConfig: (
    guildId: bigint,
    config: CustomVoiceConfigurationRequest,
    hub?: bigint | string | null,
  ) =>
    apiRequest<{ success: boolean; message: string }>(
      `customvoice/${guildId}/configuration${hubQuery(hub)}`,
      "PUT",
      config,
    ),

  disableCustomVoice: (guildId: bigint, hub?: bigint | string | null) =>
    apiRequest<{ success: boolean; message: string }>(
      `customvoice/${guildId}/configuration${hubQuery(hub)}`,
      "DELETE",
    ),

  getActiveCustomVoiceChannels: (guildId: bigint) =>
    apiRequest<CustomVoiceChannelResponse[]>(`customvoice/${guildId}/channels`),

  getCustomVoiceChannelDetails: (guildId: bigint, channelId: bigint) =>
    apiRequest<CustomVoiceChannelResponse>(
      `customvoice/${guildId}/channels/${channelId}`,
    ),

  updateCustomVoiceChannel: (
    guildId: bigint,
    channelId: bigint,
    update: UpdateCustomVoiceChannelRequest,
  ) =>
    apiRequest<{ success: boolean; message: string }>(
      `customvoice/${guildId}/channels/${channelId}`,
      "PUT",
      update,
    ),

  setCustomVoiceChannelHidden: (
    guildId: bigint,
    channelId: bigint,
    hidden: boolean,
  ) =>
    apiRequest<{ success: boolean; message: string }>(
      `customvoice/${guildId}/channels/${channelId}/hidden`,
      "PUT",
      { hidden },
    ),

  deleteCustomVoiceChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<{ success: boolean; message: string }>(
      `customvoice/${guildId}/channels/${channelId}`,
      "DELETE",
    ),

  getCustomVoiceStatistics: (guildId: bigint) =>
    apiRequest<any>(`customvoice/${guildId}/statistics`),

  cleanupInactiveChannels: (guildId: bigint, hoursInactive: number = 24) =>
    apiRequest<{ success: boolean; deletedChannels: number; message: string }>(
      `customvoice/${guildId}/cleanup?hoursInactive=${hoursInactive}`,
      "DELETE",
    ),

  getCustomVoiceUserPreferences: (guildId: bigint, userId: bigint) =>
    apiRequest<CustomVoiceUserPreference>(
      `customvoice/${guildId}/user-preferences/${userId}`,
    ),

  updateCustomVoiceUserPreferences: (
    guildId: bigint,
    userId: bigint,
    preferences: Partial<CustomVoiceUserPreference>,
  ) =>
    apiRequest<void>(
      `customvoice/${guildId}/user-preferences/${userId}`,
      "PUT",
      preferences,
    ),
};
