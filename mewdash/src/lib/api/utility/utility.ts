// lib/api/utility/utility.ts
import { apiRequest } from "../core";
import type {
  AiConfigRequest,
  AiConfigResponse,
  AiModel,
  AutoPublishChannel,
  CommandAlias,
  GuildQuote,
  QuoteListResponse,
  RoleMonitorConfig,
  StreamRoleSettings,
} from "./models";

/**
 * Utility API: aliases, quotes, auto publish, stream roles, NSFW blacklist,
 * AI assistant, and role monitoring.
 * Maps to Mewdeko.Controllers.UtilityController
 */
export const utilityApi = {
  // ============================================
  // Command aliases
  // ============================================

  getAliases: (guildId: bigint) =>
    apiRequest<CommandAlias[]>(`Utility/${guildId}/aliases`),

  addAlias: (guildId: bigint, trigger: string, mapping: string) =>
    apiRequest<{ trigger: string; mapping: string }>(
      `Utility/${guildId}/aliases`,
      "POST",
      { trigger, mapping },
    ),

  removeAlias: (guildId: bigint, trigger: string) =>
    apiRequest<void>(
      `Utility/${guildId}/aliases/${encodeURIComponent(trigger)}`,
      "DELETE",
    ),

  clearAliases: (guildId: bigint) =>
    apiRequest<{ removed: number }>(`Utility/${guildId}/aliases`, "DELETE"),

  // ============================================
  // Quotes
  // ============================================

  getQuotes: (
    guildId: bigint,
    search: string = "",
    page: number = 1,
    pageSize: number = 50,
  ) =>
    apiRequest<QuoteListResponse>(
      `Utility/${guildId}/quotes?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`,
    ),

  addQuote: (guildId: bigint, keyword: string, text: string, authorId: bigint) =>
    apiRequest<GuildQuote>(`Utility/${guildId}/quotes`, "POST", {
      keyword,
      text,
      authorId,
    }),

  updateQuote: (
    guildId: bigint,
    quoteId: number,
    request: { keyword?: string | null; text?: string | null },
  ) =>
    apiRequest<GuildQuote>(`Utility/${guildId}/quotes/${quoteId}`, "PUT", {
      ...request,
      authorId: 0n,
    }),

  deleteQuote: (guildId: bigint, quoteId: number) =>
    apiRequest<void>(`Utility/${guildId}/quotes/${quoteId}`, "DELETE"),

  // ============================================
  // Auto publish
  // ============================================

  getAutoPublish: (guildId: bigint) =>
    apiRequest<AutoPublishChannel[]>(`Utility/${guildId}/autopublish`),

  addAutoPublish: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(`Utility/${guildId}/autopublish/${channelId}`, "POST"),

  removeAutoPublish: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(`Utility/${guildId}/autopublish/${channelId}`, "DELETE"),

  blacklistPublishUser: (guildId: bigint, channelId: bigint, userId: bigint) =>
    apiRequest<void>(
      `Utility/${guildId}/autopublish/${channelId}/users/${userId}`,
      "POST",
    ),

  unblacklistPublishUser: (guildId: bigint, channelId: bigint, userId: bigint) =>
    apiRequest<void>(
      `Utility/${guildId}/autopublish/${channelId}/users/${userId}`,
      "DELETE",
    ),

  blacklistPublishWord: (guildId: bigint, channelId: bigint, word: string) =>
    apiRequest<void>(
      `Utility/${guildId}/autopublish/${channelId}/words`,
      "POST",
      { word },
    ),

  unblacklistPublishWord: (guildId: bigint, channelId: bigint, word: string) =>
    apiRequest<void>(
      `Utility/${guildId}/autopublish/${channelId}/words/${encodeURIComponent(word)}`,
      "DELETE",
    ),

  // ============================================
  // Stream role
  // ============================================

  getStreamRole: (guildId: bigint) =>
    apiRequest<StreamRoleSettings>(`Utility/${guildId}/streamrole`),

  setStreamRole: (guildId: bigint, fromRoleId: bigint, addRoleId: bigint) =>
    apiRequest<void>(`Utility/${guildId}/streamrole`, "POST", {
      fromRoleId,
      addRoleId,
    }),

  stopStreamRole: (guildId: bigint) =>
    apiRequest<void>(`Utility/${guildId}/streamrole`, "DELETE"),

  setStreamRoleKeyword: (guildId: bigint, keyword: string | null) =>
    apiRequest<{ keyword: string | null }>(
      `Utility/${guildId}/streamrole/keyword`,
      "POST",
      { word: keyword },
    ),

  addStreamRoleListUser: (
    guildId: bigint,
    list: "whitelist" | "blacklist",
    userId: bigint,
  ) =>
    apiRequest<void>(`Utility/${guildId}/streamrole/${list}/${userId}`, "POST"),

  removeStreamRoleListUser: (
    guildId: bigint,
    list: "whitelist" | "blacklist",
    userId: bigint,
  ) =>
    apiRequest<void>(
      `Utility/${guildId}/streamrole/${list}/${userId}`,
      "DELETE",
    ),

  // ============================================
  // NSFW blacklist
  // ============================================

  getNsfwBlacklist: (guildId: bigint) =>
    apiRequest<string[]>(`Utility/${guildId}/nsfw/blacklist`),

  toggleNsfwTag: (guildId: bigint, tag: string) =>
    apiRequest<{ added: boolean; tag: string }>(
      `Utility/${guildId}/nsfw/blacklist/${encodeURIComponent(tag)}`,
      "POST",
    ),

  // ============================================
  // AI assistant
  // ============================================

  getAiConfig: (guildId: bigint) =>
    apiRequest<AiConfigResponse>(`Utility/${guildId}/ai`),

  updateAiConfig: (guildId: bigint, request: AiConfigRequest) =>
    apiRequest<AiConfigResponse>(`Utility/${guildId}/ai`, "PUT", request),

  getAiModels: (guildId: bigint, provider: number) =>
    apiRequest<AiModel[]>(`Utility/${guildId}/ai/models?provider=${provider}`),

  // ============================================
  // Role monitor
  // ============================================

  getRoleMonitor: (guildId: bigint) =>
    apiRequest<RoleMonitorConfig>(`Utility/${guildId}/rolemonitor`),

  setRoleMonitorDefault: (guildId: bigint, punishment: number) =>
    apiRequest<void>(`Utility/${guildId}/rolemonitor/default`, "POST", {
      punishment,
    }),

  addBlacklistedRole: (guildId: bigint, roleId: bigint, punishment: number | null) =>
    apiRequest<void>(`Utility/${guildId}/rolemonitor/roles`, "POST", {
      roleId,
      punishment,
    }),

  removeBlacklistedRole: (guildId: bigint, roleId: bigint) =>
    apiRequest<void>(`Utility/${guildId}/rolemonitor/roles/${roleId}`, "DELETE"),

  addBlacklistedPermission: (
    guildId: bigint,
    permission: bigint,
    punishment: number | null,
  ) =>
    apiRequest<void>(`Utility/${guildId}/rolemonitor/permissions`, "POST", {
      permission,
      punishment,
    }),

  removeBlacklistedPermission: (guildId: bigint, permission: bigint) =>
    apiRequest<void>(
      `Utility/${guildId}/rolemonitor/permissions/${permission}`,
      "DELETE",
    ),

  whitelistRole: (guildId: bigint, roleId: bigint) =>
    apiRequest<void>(
      `Utility/${guildId}/rolemonitor/whitelist/roles/${roleId}`,
      "POST",
    ),

  unwhitelistRole: (guildId: bigint, roleId: bigint) =>
    apiRequest<void>(
      `Utility/${guildId}/rolemonitor/whitelist/roles/${roleId}`,
      "DELETE",
    ),

  whitelistUser: (guildId: bigint, userId: bigint) =>
    apiRequest<void>(
      `Utility/${guildId}/rolemonitor/whitelist/users/${userId}`,
      "POST",
    ),

  unwhitelistUser: (guildId: bigint, userId: bigint) =>
    apiRequest<void>(
      `Utility/${guildId}/rolemonitor/whitelist/users/${userId}`,
      "DELETE",
    ),
};
