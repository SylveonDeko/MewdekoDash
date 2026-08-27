import { apiRequest } from "../core";
import type {
  AddStatChannelRequest,
  StatChannel,
  StatChannelMetadata,
  StatChannelPreviewRequest,
  StatChannelSettings,
  UpdateStatChannelRequest,
} from "./models";

/**
 * Stat Channels API
 * Maps to Mewdeko.Controllers.StatChannelController
 */
export const statChannelsApi = {
  /**
   * Gets all stat channels for a guild
   */
  getStatChannels: (guildId: bigint) =>
    apiRequest<StatChannel[]>(`StatChannel/${guildId}`),

  /**
   * Gets the catalogue of stat types, display styles and update mechanisms
   */
  getMetadata: (guildId: bigint) =>
    apiRequest<StatChannelMetadata>(`StatChannel/${guildId}/metadata`),

  /**
   * Gets the guild wide defaults applied to new stat channels
   */
  getSettings: (guildId: bigint) =>
    apiRequest<StatChannelSettings>(`StatChannel/${guildId}/settings`),

  /**
   * Updates the guild wide defaults applied to new stat channels
   */
  updateSettings: (guildId: bigint, request: Partial<StatChannelSettings>) =>
    apiRequest<StatChannelSettings>(`StatChannel/${guildId}/settings`, "PUT", request),

  /**
   * Renders a template without saving it, for live previews
   */
  preview: (guildId: bigint, request: StatChannelPreviewRequest) =>
    apiRequest<{ rendered: string }>(`StatChannel/${guildId}/preview`, "POST", request),

  /**
   * Adds a new stat channel
   */
  addStatChannel: (guildId: bigint, request: AddStatChannelRequest) =>
    apiRequest<StatChannel>(`StatChannel/${guildId}`, "POST", request),

  /**
   * Updates a stat channel. Omitted fields are left unchanged.
   */
  updateStatChannel: (guildId: bigint, channelId: bigint, request: UpdateStatChannelRequest) =>
    apiRequest<StatChannel>(`StatChannel/${guildId}/${channelId}`, "PUT", request),

  /**
   * Removes a stat channel
   */
  removeStatChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(`StatChannel/${guildId}/${channelId}`, "DELETE"),
};
