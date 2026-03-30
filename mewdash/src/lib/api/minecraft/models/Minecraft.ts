// lib/api/minecraft/models/Minecraft.ts

/**
 * Registered Minecraft server configuration
 * Maps to Mewdeko.Controllers.Common.Minecraft.MinecraftServerResponse
 */
export interface MinecraftServer {
  id: number;
  name: string;
  address: string;
  port: number;
  serverType: number;
  queryPort: number;
  isDefault: boolean;
  watchChannelId: bigint | null;
  watchMessageId: bigint | null;
  watchInterval: number;
  watchMode: number;
  customOnlineMessage: string | null;
  customOfflineMessage: string | null;
  rconEnabled: boolean;
  rconPort: number;
  hasRconPassword: boolean;
  hasPluginKey: boolean;
  customEmbedTemplate: string | null;
  lastOnline: boolean | null;
  dateAdded: string | null;
}

/**
 * Live Minecraft server status
 * Maps to Mewdeko.Controllers.Common.Minecraft.MinecraftStatusResponse
 */
export interface MinecraftStatus {
  isOnline: boolean;
  motd: string;
  playersOnline: number;
  playersMax: number;
  playerList: string[];
  playerUuids: Record<string, string>;
  version: string;
  latency: number;
  map: string | null;
  gameMode: string | null;
  software: string | null;
  plugins: string[];
  isQueryResponse: boolean;
}

/**
 * Request to add a Minecraft server
 * Maps to Mewdeko.Controllers.Common.Minecraft.AddMinecraftServerRequest
 */
export interface AddMinecraftServerRequest {
  name: string;
  address: string;
  port: number;
  serverType: number;
  queryPort: number;
}

/**
 * Request to update a Minecraft server
 * Maps to Mewdeko.Controllers.Common.Minecraft.UpdateMinecraftServerRequest
 */
export interface UpdateMinecraftServerRequest {
  address?: string;
  port?: number;
  serverType?: number;
  queryPort?: number;
  isDefault?: boolean;
}

/**
 * Request to configure server watch
 * Maps to Mewdeko.Controllers.Common.Minecraft.SetWatchRequest
 */
export interface SetWatchRequest {
  channelId: bigint | null;
  interval?: number;
  watchMode?: number;
}

/**
 * Request to set custom embed template
 * Maps to Mewdeko.Controllers.Common.Minecraft.SetCustomEmbedRequest
 */
export interface SetCustomEmbedRequest {
  template: string | null;
}

/**
 * A historical status snapshot for a Minecraft server
 */
/**
 * Request to configure RCON
 */
export interface SetRconConfigRequest {
  enabled: boolean;
  port: number;
  password?: string;
}

/**
 * Request to send an RCON command
 */
export interface RconCommandRequest {
  command: string;
}

/**
 * Response from an RCON command
 */
export interface RconCommandResponse {
  success: boolean;
  response: string;
  rawResponse: string | null;
}

export interface MinecraftSnapshot {
  isOnline: boolean;
  playersOnline: number;
  playersMax: number;
  latency: number;
  version: string | null;
  timestamp: string;
}
