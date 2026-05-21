import { apiRequest } from "../core";
import type { StatChannel, AddStatChannelRequest, UpdateStatChannelRequest } from "./models";

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
   * Adds a new stat channel
   */
  addStatChannel: (guildId: bigint, request: AddStatChannelRequest) =>
    apiRequest<StatChannel>(`StatChannel/${guildId}`, "POST", request),

  /**
   * Updates a stat channel's template
   */
  updateStatChannel: (guildId: bigint, channelId: bigint, request: UpdateStatChannelRequest) =>
    apiRequest<StatChannel>(`StatChannel/${guildId}/${channelId}`, "PUT", request),

  /**
   * Removes a stat channel
   */
  removeStatChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(`StatChannel/${guildId}/${channelId}`, "DELETE"),
};
