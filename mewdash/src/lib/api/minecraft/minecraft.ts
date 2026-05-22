// lib/api/minecraft/minecraft.ts
import { apiRequest } from "../core";
import type {
  MinecraftServer,
  MinecraftStatus,
  MinecraftSnapshot,
  AddMinecraftServerRequest,
  UpdateMinecraftServerRequest,
  SetWatchRequest,
  SetCustomEmbedRequest,
  SetRconConfigRequest,
  RconCommandResponse,
} from "./models";

/**
 * Minecraft Server API
 * Maps to Mewdeko.Controllers.MinecraftController
 */
export const minecraftApi = {
  /**
   * Gets all registered Minecraft servers for a guild
   * @param guildId The guild ID
   */
  getServers: (guildId: bigint) =>
    apiRequest<MinecraftServer[]>(`Minecraft/${guildId}/servers`),

  /**
   * Gets a specific server by name
   * @param guildId The guild ID
   * @param name The server name
   */
  getServer: (guildId: bigint, name: string) =>
    apiRequest<MinecraftServer>(`Minecraft/${guildId}/servers/${name}`),

  /**
   * Adds a new Minecraft server
   * @param guildId The guild ID
   * @param request The server details
   */
  addServer: (guildId: bigint, request: AddMinecraftServerRequest) =>
    apiRequest<MinecraftServer>(`Minecraft/${guildId}/servers`, "POST", request),

  /**
   * Updates a server's configuration
   * @param guildId The guild ID
   * @param name The server name
   * @param request The fields to update
   */
  updateServer: (guildId: bigint, name: string, request: UpdateMinecraftServerRequest) =>
    apiRequest<MinecraftServer>(`Minecraft/${guildId}/servers/${name}`, "PUT", request),

  /**
   * Removes a registered server
   * @param guildId The guild ID
   * @param name The server name
   */
  removeServer: (guildId: bigint, name: string) =>
    apiRequest<void>(`Minecraft/${guildId}/servers/${name}`, "DELETE"),

  /**
   * Configures the watch channel and interval for a server
   * @param guildId The guild ID
   * @param name The server name
   * @param request The watch configuration
   */
  setWatch: (guildId: bigint, name: string, request: SetWatchRequest) =>
    apiRequest<MinecraftServer>(`Minecraft/${guildId}/servers/${name}/watch`, "PUT", request),

  /**
   * Sets or clears a custom embed template for a server
   * @param guildId The guild ID
   * @param name The server name
   * @param request The embed template
   */
  setCustomEmbed: (guildId: bigint, name: string, request: SetCustomEmbedRequest) =>
    apiRequest<MinecraftServer>(`Minecraft/${guildId}/servers/${name}/embed`, "PUT", request),

  /**
   * Queries the live status of a registered server
   * @param guildId The guild ID
   * @param name The server name
   */
  getServerStatus: (guildId: bigint, name: string) =>
    apiRequest<MinecraftStatus>(`Minecraft/${guildId}/servers/${name}/status`),

  /**
   * Queries the live status of an arbitrary address
   * @param guildId The guild ID
   * @param address The server address (host or host:port)
   */
  queryDirect: (guildId: bigint, address: string) =>
    apiRequest<MinecraftStatus>(`Minecraft/${guildId}/query/${address}`),

  /**
   * Gets the cached last-known status without live querying
   * @param guildId The guild ID
   * @param name The server name
   */
  getCachedStatus: (guildId: bigint, name: string) =>
    apiRequest<MinecraftStatus>(`Minecraft/${guildId}/servers/${name}/cached-status`),

  /**
   * Gets historical snapshots for a server
   * @param guildId The guild ID
   * @param name The server name
   * @param hours How many hours of history (default 24, max 720)
   */
  getHistory: (guildId: bigint, name: string, hours: number = 24) =>
    apiRequest<MinecraftSnapshot[]>(`Minecraft/${guildId}/servers/${name}/history?hours=${hours}`),

  /**
   * Sets the custom online alert message
   */
  setOnlineMessage: (guildId: bigint, name: string, template: string | null) =>
    apiRequest<MinecraftServer>(`Minecraft/${guildId}/servers/${name}/online-message`, "PUT", { template }),

  /**
   * Sets the custom offline alert message
   */
  setOfflineMessage: (guildId: bigint, name: string, template: string | null) =>
    apiRequest<MinecraftServer>(`Minecraft/${guildId}/servers/${name}/offline-message`, "PUT", { template }),

  /**
   * Updates event templates for a server
   */
  setEventTemplates: (guildId: bigint, name: string, templates: string | null) =>
    apiRequest<MinecraftServer>(`Minecraft/${guildId}/servers/${name}/event-templates`, "PUT", { template: templates }),

  /**
   * Generates a new plugin API key for a server
   */
  generatePluginKey: (guildId: bigint, name: string) =>
    apiRequest<{ key: string }>(`Minecraft/${guildId}/servers/${name}/plugin-key`, "POST"),

  /**
   * Revokes the plugin API key for a server
   */
  revokePluginKey: (guildId: bigint, name: string) =>
    apiRequest<void>(`Minecraft/${guildId}/servers/${name}/plugin-key`, "DELETE"),

  /**
   * Configures RCON settings for a server
   * @param guildId The guild ID
   * @param name The server name
   * @param request The RCON configuration
   */
  setRconConfig: (guildId: bigint, name: string, request: SetRconConfigRequest) =>
    apiRequest<MinecraftServer>(`Minecraft/${guildId}/servers/${name}/rcon`, "PUT", request),

  /**
   * Sends an RCON command to a server
   * @param guildId The guild ID
   * @param name The server name
   * @param command The command to execute
   */
  sendRconCommand: (guildId: bigint, name: string, command: string) =>
    apiRequest<RconCommandResponse>(`Minecraft/${guildId}/servers/${name}/rcon`, "POST", { command }),
};
