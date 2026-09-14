// lib/api/utility/models/Utility.ts

/**
 * A command alias
 */
export interface CommandAlias {
  id: number;
  trigger: string;
  mapping: string;
  dateAdded: string | null;
}

/**
 * A stored quote
 * Maps to DataModel.Quote
 */
export interface GuildQuote {
  id: number;
  guildId: bigint;
  keyword: string;
  authorName: string;
  authorId: bigint;
  text: string;
  useCount: number;
  dateAdded: string | null;
}

export interface QuoteListResponse {
  total: number;
  page: number;
  pageSize: number;
  quotes: GuildQuote[];
}

/**
 * Auto publish channel with its blacklists
 */
export interface AutoPublishChannel {
  channelId: bigint;
  channelName: string | null;
  blacklistedUsers: bigint[];
  blacklistedWords: string[];
}

export interface StreamRoleListUser {
  userId: bigint;
  username: string | null;
}

/**
 * Stream role settings
 */
export interface StreamRoleSettings {
  enabled: boolean;
  addRoleId: bigint;
  fromRoleId: bigint;
  keyword: string | null;
  whitelist: StreamRoleListUser[];
  blacklist: StreamRoleListUser[];
}

/**
 * Mirrors Mewdeko.Modules.Utility.Services.AiService.AiProvider
 */
export enum AiProvider {
  OpenAi = 0,
  Groq = 1,
  Claude = 2,
}

/**
 * AI assistant configuration with the key masked
 */
export interface AiConfigResponse {
  enabled: boolean;
  channelId: bigint;
  provider: number;
  providerName: string;
  model: string | null;
  systemPrompt: string | null;
  webSearchEnabled: boolean;
  hideWebSearchMessages: boolean;
  hasApiKey: boolean;
  apiKeyHint: string | null;
  customEmbed: string | null;
  hasWebhook: boolean;
  tokensUsed: number;
}

export interface AiConfigRequest {
  enabled?: boolean | null;
  channelId?: bigint | null;
  provider?: number | null;
  model?: string | null;
  systemPrompt?: string | null;
  webSearchEnabled?: boolean | null;
  hideWebSearchMessages?: boolean | null;
  apiKey?: string | null;
  clearApiKey?: boolean | null;
  customEmbed?: string | null;
  webhookUrl?: string | null;
}

export interface AiModel {
  id: string;
  name: string;
}

/**
 * Role monitor configuration
 */
export interface RoleMonitorConfig {
  defaultPunishment: number;
  blacklistedRoles: Array<{ roleId: bigint; punishment: number | null }>;
  blacklistedPermissions: Array<{ permission: bigint; permissionName: string; punishment: number | null }>;
  whitelistedRoles: bigint[];
  whitelistedUsers: bigint[];
}
