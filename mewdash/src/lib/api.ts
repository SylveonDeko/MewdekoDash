// lib/api.ts
import type {
  BotInstance,
  BotReviews,
  BotStatusModel,
  ChatTriggers,
  GraphStatsResponse,
  GuildConfig,
  Module,
  MultiGreet,
  MultiGreetType,
  PermissionCache,
  Permissionv2,
  SuggestionsModel
} from "$lib/types/models";
import JSONbig from "json-bigint";
import { logger } from "$lib/logger";
import type { Giveaways, PermissionOverride } from "$lib/types.ts";
import { currentInstance } from "$lib/stores/instanceStore.ts";
import { get } from "svelte/store";
import { PUBLIC_MEWDEKO_API_URL } from "$env/static/public";
import type { DiscordGuild } from "$lib/types/discordGuild.ts";

const ALLOWED_ORIGINS = ["localhost", "127.0.0.1"];
const ALLOWED_PORTS = new Set(["3000", "5173"]);

async function apiRequest<T>(
  endpoint: string,
  method: string = "GET",
  body?: any,
  headers: HeadersInit = {},
  customFetch: typeof fetch = fetch
): Promise<T> {
  const instance = get(currentInstance);
  let baseUrl = instance ? `http://localhost:${instance.port}/botapi` : PUBLIC_MEWDEKO_API_URL;

  const response = await customFetch(`/api/${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Instance-Url": baseUrl,
      ...headers
    },
    body: body ? JSONbig.stringify(body) : undefined
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.debug(`API error: ${response.status} - ${errorText}`);
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  const responseText = await response.text();

  try {
    return JSONbig.parse(responseText) as T;
  } catch (err) {
    logger.error("Error parsing JSON response:", err);
    throw new Error("Failed to parse JSON response.");
  }
}


type SuggestStateUpdate = {
  state: number;
  reason: string | null;
  userId: bigint;
};

export const api = {

// XP Management endpoints
  getXpSettings: (guildId: bigint) =>
    apiRequest<any>(`xp/${guildId}/settings`),

  updateXpSettings: (guildId: bigint, settings: any) =>
    apiRequest<any>(`xp/${guildId}/settings`, "POST", settings),

  getUserXpStats: (guildId: bigint, userId: bigint) =>
    apiRequest<{
      userId: bigint;
      guildId: bigint;
      totalXp: number;
      level: number;
      levelXp: number;
      requiredXp: number;
      rank: number;
      bonusXp: number;
      username: string;
      avatarUrl: string;
      timeOnLevel: {
        days: number;
        hours: number;
        minutes: number;
      };
    }>(`xp/${guildId}/user/${userId}`),

  addUserXp: (guildId: bigint, userId: bigint, amount: number) =>
    apiRequest<void>(`xp/${guildId}/user/${userId}/add`, "POST", amount),

  resetUserXp: (guildId: bigint, userId: bigint, resetBonusXp: boolean = false) =>
    apiRequest<void>(`xp/${guildId}/user/${userId}/reset`, "POST", resetBonusXp),

  setUserXp: (guildId: bigint, userId: bigint, amount: number) =>
    apiRequest<void>(`xp/${guildId}/user/${userId}/set`, "POST", amount),

  getXpLeaderboard: (guildId: bigint, page: number = 1, pageSize: number = 10) =>
    apiRequest<Array<{
      userId: bigint;
      guildId: bigint;
      totalXp: number;
      level: number;
      levelXp: number;
      requiredXp: number;
      rank: number;
      username: string;
      avatarUrl: string;
    }>>(`xp/${guildId}/leaderboard?page=${page}&pageSize=${pageSize}`),

  getXpRoleRewards: (guildId: bigint) =>
    apiRequest<Array<{
      id: number;
      guildId: bigint;
      level: number;
      roleId: bigint;
      roleName: string;
    }>>(`xp/${guildId}/rewards/roles`),

  addXpRoleReward: (guildId: bigint, level: number, roleId: bigint) =>
    apiRequest<void>(`xp/${guildId}/rewards/roles`, "POST", { level, roleId }),

  removeXpRoleReward: (guildId: bigint, rewardId: number) =>
    apiRequest<void>(`xp/${guildId}/rewards/roles/${rewardId}`, "DELETE"),

  getXpCurrencyRewards: (guildId: bigint) =>
    apiRequest<Array<{
      id: number;
      guildId: bigint;
      level: number;
      amount: number;
    }>>(`xp/${guildId}/rewards/currency`),

  addXpCurrencyReward: (guildId: bigint, level: number, amount: number) =>
    apiRequest<void>(`xp/${guildId}/rewards/currency`, "POST", { level, amount }),

  removeXpCurrencyReward: (guildId: bigint, rewardId: number) =>
    apiRequest<void>(`xp/${guildId}/rewards/currency/${rewardId}`, "DELETE"),

  getXpExcludedChannels: (guildId: bigint) =>
    apiRequest<Array<bigint>>(`xp/${guildId}/excluded/channels`),

  excludeXpChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(`xp/${guildId}/excluded/channels`, "POST", channelId),

  includeXpChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(`xp/${guildId}/excluded/channels/${channelId}`, "DELETE"),

  getXpExcludedRoles: (guildId: bigint) =>
    apiRequest<Array<bigint>>(`xp/${guildId}/excluded/roles`),

  excludeXpRole: (guildId: bigint, roleId: bigint) =>
    apiRequest<void>(`xp/${guildId}/excluded/roles`, "POST", roleId),

  includeXpRole: (guildId: bigint, roleId: bigint) =>
    apiRequest<void>(`xp/${guildId}/excluded/roles/${roleId}`, "DELETE"),

  getXpTemplate: (guildId: bigint) =>
    apiRequest<any>(`xp/${guildId}/template`),

  updateXpTemplate: (guildId: bigint, template: any) =>
    apiRequest<void>(`xp/${guildId}/template`, "POST", template),

  getXpServerStats: (guildId: bigint) =>
    apiRequest<{
      totalUsers: number;
      totalXp: number;
      averageLevel: number;
      highestLevel: number;
      recentActivity: Array<{
        userId: bigint;
        username: string;
        avatarUrl: string;
        timestamp: string;
      }>;
    }>(`xp/${guildId}/stats`),

  playTrackAt: (guildId: bigint, index: number) =>
    apiRequest<void>(`music/${guildId}/play-track/${index}`, "POST"),

  getChatMessages: (guildId: bigint, channelId: bigint, after: string) =>
    apiRequest<Array<{
      id: string;
      content: string;
      author: {
        id: string;
        username: string;
        avatarUrl: string;
      };
      timestamp: string;
      attachments: Array<{
        url: string;
        proxyUrl: string;
        filename: string;
        fileSize: number;
      }>;
      embeds: Array<{
        type: string;
        title: string;
        description: string;
        url: string;
        thumbnail: string | null;
        author: {
          name: string;
          iconUrl: string;
        } | null;
      }>;
    }>>(
      `Chat/${guildId}/${channelId}/messages?after=${encodeURIComponent(after)}`
    ),

  getChatLogs: (guildId: bigint) =>
    apiRequest<Array<{
      id: string;
      channelId: string;
      channelName: string;
      name: string;
      timestamp: string;
      createdBy: string;
      messageCount: number;
    }>>(
      `Chat/${guildId}/logs`
    ),

  getChatLog: (guildId: bigint, logId: string) =>
    apiRequest<{
      id: string;
      guildId: string;
      channelId: string;
      channelName: string;
      name: string;
      timestamp: string;
      createdBy: string;
      messageCount: number;
      messages: Array<any>;
    }>(
      `Chat/${guildId}/logs/${logId}`
    ),

  saveChatLog: (guildId: bigint, data: {
    channelId: bigint;
    name: string;
    createdBy: bigint;
    messages: Array<any>;
  }) =>
    apiRequest<{ id: string }>(
      `Chat/${guildId}/logs`,
      "POST",
      data
    ),

  updateChatLogName: (guildId: bigint, logId: string, name: string) =>
    apiRequest<void>(
      `Chat/${guildId}/logs/${logId}`,
      "PATCH",
      { name }
    ),

  deleteChatLog: (guildId: bigint, logId: string) =>
    apiRequest<void>(
      `Chat/${guildId}/logs/${logId}`,
      "DELETE"
    ),

  getGuildMembers: (guildId: bigint) =>
    apiRequest<Array<{
      id: string;
      username: string;
      displayName: string;
      avatarUrl: string;
    }>>(
      `ClientOperations/members/${guildId}`
    ),

  getCommandsAndModules: () =>
    apiRequest<Module[]>("Permissions/commands"),

  getPermissions: (guildId: bigint) =>
    apiRequest<PermissionCache>(`Permissions/regular/${guildId}`),

  addPermission: (guildId: bigint, permission: Omit<Permissionv2, "guildConfigId">) =>
    apiRequest<void>(`Permissions/regular/${guildId}`, "POST", {
      ...permission,
      primaryTargetId: permission.primaryTargetId.toString(), // Convert BigInt to string for C#'s ulong
      isCustomCommand: permission.isCustomCommand ?? false,    // Ensure default value matches C#
      secondaryTargetName: permission.secondaryTargetName || "*" // Provide default if null
    }),

  removePermission: (guildId: bigint, index: number) =>
    apiRequest<void>(`Permissions/regular/${guildId}/${index}`, "DELETE"),

  movePermission: (guildId: bigint, from: number, to: number) =>
    apiRequest<void>(`Permissions/regular/${guildId}/move`, "POST", { from, to }),

  resetPermissions: (guildId: bigint) =>
    apiRequest<void>(`Permissions/regular/${guildId}/reset`, "POST"),

  setVerbose: (guildId: bigint, verbose: boolean) =>
    apiRequest<void>(`Permissions/regular/${guildId}/verbose`, "POST", { verbose }),

  setPermissionRole: (guildId: bigint, roleId: string | null) =>
    apiRequest<void>(`Permissions/regular/${guildId}/role`, "POST", roleId),
  getAfkStatus: (guildId: bigint, userId: string) =>
    apiRequest<{ message: string }>(`afk/${guildId}/${userId}`),
  setAfkStatus: (guildId: bigint, userId: bigint, message: string) =>
    apiRequest<void>(`afk/${guildId}/${userId}`, "POST", message),
  deleteAfkStatus: (guildId: bigint, userId: bigint) =>
    apiRequest<void>(`afk/${guildId}/${userId}`, "DELETE"),
  getAllAfkStatus: (guildId: bigint) =>
    apiRequest<
      Array<{
        userId: bigint;
        username: string;
        nickname: string | null;
        avatarUrl: string;
        afkStatus: {
          userId: bigint;
          guildId: bigint;
          message: string;
          wasTimed: boolean;
          when: string;
          id: number;
          dateAdded: string;
        } | null;
      }>
    >(`afk/${guildId}`),
  getChatTriggers: (guildId: bigint) =>
    apiRequest<ChatTriggers[]>(`chattriggers/${guildId}`),
  getAfkDel: (guildId: bigint) => apiRequest<number>(`afk/${guildId}/deletion`),
  afkDelSet: (guildId: bigint, time: number) =>
    apiRequest<void>(`afk/${guildId}/deletion`, "POST", time),
  getAfkLength: (guildId: bigint) =>
    apiRequest<number>(`afk/${guildId}/length`),
  afkLengthSet: (guildId: bigint, length: number) =>
    apiRequest<void>(`afk/${guildId}/length`, "POST", length),
  getAfkType: (guildId: bigint) => apiRequest<number>(`afk/${guildId}/type`),
  afkTypeSet: (guildId: bigint, type: number) =>
    apiRequest<void>(`afk/${guildId}/type`, "POST", type),
  getAfkTimeout: (guildId: bigint) =>
    apiRequest<number>(`afk/${guildId}/timeout`),
  afkTimeoutSet: (guildId: bigint, timeout: number) =>
    apiRequest<void>(`afk/${guildId}/timeout`, "POST", timeout),
  getDisabledAfkChannels: (guildId: bigint) =>
    apiRequest<string | null>(`afk/${guildId}/disabled-channels`),
  afkDisabledSet: (guildId: bigint, channels: string) =>
    apiRequest<void>(`afk/${guildId}/disabled-channels`, "POST", { channels }),
  getCustomAfkMessage: (guildId: bigint) =>
    apiRequest<string>(`afk/${guildId}/custom-message`),
  setCustomAfkMessage: (guildId: bigint, message: string) =>
    apiRequest<void>(`afk/${guildId}/custom-message`, "POST", message),

  getBotInstances: () =>
    apiRequest<BotInstance[]>("InstanceManagement"),

  addBotInstance: (port: number) =>
    apiRequest<void>(`InstanceManagement/${port}`, "POST"),

  removeBotInstance: (port: number) =>
    apiRequest<void>(`InstanceManagement/${port}`, "DELETE"),

  deleteChatTrigger: (guildId: bigint, triggerId: number) =>
    apiRequest<void>(`chattriggers/${guildId}/${triggerId}`, "DELETE"),
  updateChatTrigger: (guildId: bigint, trigger: ChatTriggers) =>
    apiRequest<void>(`chattriggers/${guildId}`, "PATCH", trigger),
  addChatTrigger: (guildId: bigint, trigger: Omit<ChatTriggers, "id">) =>
    apiRequest<ChatTriggers>(`chattriggers/${guildId}`, "POST", trigger),

  getGuildConfig: (guildId: bigint) =>
    apiRequest<GuildConfig>(`guildconfig/${guildId}`),
  updateGuildConfig: (guildId: bigint, config: GuildConfig) =>
    apiRequest<void>(`GuildConfig/${guildId}`, "POST", config),

  getSuggestions: (guildId: bigint) =>
    apiRequest<SuggestionsModel[]>(`suggestions/${guildId}`),

  // Delete a suggestion
  deleteSuggestion: (guildId: bigint, id: number) =>
    apiRequest<void>(`suggestions/${guildId}/${id}`, "DELETE"),

  // Update suggestion status
  updateSuggestionStatus: (guildId: bigint, suggestionId: bigint, update: SuggestStateUpdate) =>
    apiRequest<void>(`suggestions/${guildId}/${suggestionId}`, "PATCH", update),

  // Length settings
  getMinLength: (guildId: bigint) =>
    apiRequest<number>(`suggestions/${guildId}/minLength`),

  setMinLength: (guildId: bigint, minLength: number) =>
    apiRequest<void>(`suggestions/${guildId}/minLength`, "POST", minLength),

  getMaxLength: (guildId: bigint) =>
    apiRequest<number>(`suggestions/${guildId}/maxLength`),

  setMaxLength: (guildId: bigint, maxLength: number) =>
    apiRequest<void>(`suggestions/${guildId}/maxLength`, "POST", maxLength),

  // Message settings
  getAcceptMessage: (guildId: bigint) =>
    apiRequest<string | null>(`suggestions/${guildId}/acceptMessage`),

  setAcceptMessage: (guildId: bigint, message: string | null) =>
    apiRequest<void>(`suggestions/${guildId}/acceptMessage`, "POST", message),

  getDenyMessage: (guildId: bigint) =>
    apiRequest<string | null>(`suggestions/${guildId}/denyMessage`),

  setDenyMessage: (guildId: bigint, message: string | null) =>
    apiRequest<void>(`suggestions/${guildId}/denyMessage`, "POST", message),

  getConsiderMessage: (guildId: bigint) =>
    apiRequest<string | null>(`suggestions/${guildId}/considerMessage`),

  setConsiderMessage: (guildId: bigint, message: string | null) =>
    apiRequest<void>(`suggestions/${guildId}/considerMessage`, "POST", message),

  getImplementMessage: (guildId: bigint) =>
    apiRequest<string | null>(`suggestions/${guildId}/implementMessage`),

  setImplementMessage: (guildId: bigint, message: string | null) =>
    apiRequest<void>(`suggestions/${guildId}/implementMessage`, "POST", message),

  // Channel settings
  getAcceptChannel: (guildId: bigint) =>
    apiRequest<bigint>(`suggestions/${guildId}/acceptChannel`),

  setAcceptChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(`suggestions/${guildId}/acceptChannel`, "POST", channelId),

  getDenyChannel: (guildId: bigint) =>
    apiRequest<bigint>(`suggestions/${guildId}/denyChannel`),

  setDenyChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(`suggestions/${guildId}/denyChannel`, "POST", channelId),

  getConsiderChannel: (guildId: bigint) =>
    apiRequest<bigint>(`suggestions/${guildId}/considerChannel`),

  setConsiderChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(`suggestions/${guildId}/considerChannel`, "POST", channelId),

  getImplementChannel: (guildId: bigint) =>
    apiRequest<bigint>(`suggestions/${guildId}/implementChannel`),

  setImplementChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(`suggestions/${guildId}/implementChannel`, "POST", channelId),

  // Thread settings
  getSuggestThreadsType: (guildId: bigint) =>
    apiRequest<number>(`suggestions/${guildId}/suggestThreadsType`),

  setSuggestThreadsType: (guildId: bigint, type: number) =>
    apiRequest<void>(`suggestions/${guildId}/suggestThreadsType`, "POST", type),

  // Button settings
  getSuggestButtonChannel: (guildId: bigint) =>
    apiRequest<bigint>(`suggestions/${guildId}/suggestButtonChannel`),

  setSuggestButtonChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(`suggestions/${guildId}/suggestButtonChannel`, "POST", channelId),

  getSuggestButtonMessage: (guildId: bigint) =>
    apiRequest<string | null>(`suggestions/${guildId}/suggestButtonMessage`),

  setSuggestButtonMessage: (guildId: bigint, message: string | null) =>
    apiRequest<void>(`suggestions/${guildId}/suggestButtonMessage`, "POST", message),

  getSuggestButtonLabel: (guildId: bigint) =>
    apiRequest<string | null>(`suggestions/${guildId}/suggestButtonLabel`),

  setSuggestButtonLabel: (guildId: bigint, label: string | null) =>
    apiRequest<void>(`suggestions/${guildId}/suggestButtonLabel`, "POST", label),

  getSuggestButtonEmote: (guildId: bigint) =>
    apiRequest<string | null>(`suggestions/${guildId}/suggestButtonEmote`),

  setSuggestButtonEmote: (guildId: bigint, emote: string | null) =>
    apiRequest<void>(`suggestions/${guildId}/suggestButtonEmote`, "POST", emote),

  // Archive settings
  getArchiveOnDeny: (guildId: bigint) =>
    apiRequest<boolean>(`suggestions/${guildId}/archiveOnDeny`),

  setArchiveOnDeny: (guildId: bigint, archive: boolean) =>
    apiRequest<void>(`suggestions/${guildId}/archiveOnDeny`, "POST", archive),

  getArchiveOnAccept: (guildId: bigint) =>
    apiRequest<boolean>(`suggestions/${guildId}/archiveOnAccept`),

  setArchiveOnAccept: (guildId: bigint, archive: boolean) =>
    apiRequest<void>(`suggestions/${guildId}/archiveOnAccept`, "POST", archive),

  getArchiveOnConsider: (guildId: bigint) =>
    apiRequest<boolean>(`suggestions/${guildId}/archiveOnConsider`),

  setArchiveOnConsider: (guildId: bigint, archive: boolean) =>
    apiRequest<void>(`suggestions/${guildId}/archiveOnConsider`, "POST", archive),

  getArchiveOnImplement: (guildId: bigint) =>
    apiRequest<boolean>(`suggestions/${guildId}/archiveOnImplement`),

  setArchiveOnImplement: (guildId: bigint, archive: boolean) =>
    apiRequest<void>(`suggestions/${guildId}/archiveOnImplement`, "POST", archive),

  getSuggestChannel: (guildId: bigint) =>
    apiRequest<bigint>(`suggestions/${guildId}/suggestChannel`),

  setSuggestChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(`suggestions/${guildId}/suggestChannel`, "POST", channelId),

  // Emote settings
  getSuggestEmotes: (guildId: bigint) =>
    apiRequest<string | null>(`suggestions/${guildId}/suggestEmotes`),

  setSuggestEmotes: (guildId: bigint, emotes: string | null) =>
    apiRequest<void>(`suggestions/${guildId}/suggestEmotes`, "POST", emotes),

  getMultiGreets: (guildId: bigint) =>
    apiRequest<MultiGreet[]>(`multigreet/${guildId}`),

  addMultiGreet: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(`multigreet/${guildId}`, "POST", channelId),

  removeMultiGreet: (guildId: bigint, greetId: number) =>
    apiRequest<void>(`multigreet/${guildId}/${greetId}`, "DELETE"),

  updateMultiGreetMessage: (
    guildId: bigint,
    greetId: number,
    message: string
  ) =>
    apiRequest<void>(
      `multigreet/${guildId}/${greetId}/message`,
      "PUT",
      message
    ),

  updateMultiGreetDeleteTime: (
    guildId: bigint,
    greetId: number,
    time: string
  ) =>
    apiRequest<void>(
      `multigreet/${guildId}/${greetId}/delete-time`,
      "PUT",
      time
    ),

  updateMultiGreetGreetBots: (
    guildId: bigint,
    greetId: number,
    enabled: boolean
  ) =>
    apiRequest<void>(
      `multigreet/${guildId}/${greetId}/greet-bots`,
      "PUT",
      enabled
    ),

  updateMultiGreetWebhook: (
    guildId: bigint,
    greetId: number,
    webhook: {
      name: string | null;
      avatarUrl?: string;
    }
  ) =>
    apiRequest<void>(
      `multigreet/${guildId}/${greetId}/webhook`,
      "PUT",
      webhook
    ),

  updateMultiGreetDisabled: (
    guildId: bigint,
    greetId: number,
    disabled: boolean
  ) =>
    apiRequest<void>(
      `multigreet/${guildId}/${greetId}/disable`,
      "PUT",
      disabled
    ),

  getMultiGreetType: (guildId: bigint) =>
    apiRequest<MultiGreetType>(`multigreet/${guildId}/type`),

  setMultiGreetType: (guildId: bigint, type: MultiGreetType) =>
    apiRequest<void>(`multigreet/${guildId}/type`, "PUT", type.valueOf()),

  getGuildRoles: (guildId: bigint) =>
    apiRequest<Array<{ id: string; name: string }>>(
      `ClientOperations/roles/${guildId}`
    ),

  getBotGuilds: () => apiRequest<Array<bigint>>("ClientOperations/guilds"),

  getUser: (guildId: bigint, userId: bigint) =>
    apiRequest<any>(`ClientOperations/user/${guildId}/${userId}`),

  getUsers: (guildId: bigint, userIds: bigint[]) =>
    apiRequest<any[]>(`ClientOperations/users/${guildId}`, "POST", userIds),

  getBotStatus: () => apiRequest<BotStatusModel>("BotStatus"),

  getMutualGuilds: (userId: bigint, customFetch: typeof fetch = fetch, additionalHeaders: HeadersInit = {}) =>
    apiRequest<DiscordGuild[] | undefined | null>(
      `ClientOperations/mutualguilds/${userId}`,
      "GET",
      undefined,
      additionalHeaders,
      customFetch
    ),

  isOwner: (userId: bigint) =>
    apiRequest<boolean>(`Ownership/${userId}`),

  getPerformanceData: (userId: bigint) =>
    apiRequest<Array<{
      methodName: string;
      callCount: number;
      totalTime: number;
      avgExecutionTime: number;
      lastExecuted: string;
    }>>(`Performance?userId=${userId}`),

  clearPerformanceData: (userId: bigint) =>
    apiRequest<void>(`Performance/clear?userId=${userId}`, "POST"),

  getSystemInfo: (userId: bigint) =>
    apiRequest<{
      cpuUsage: number;
      memoryUsageMb: number;
      totalMemoryMb: number;
      uptime: string;
      processStartTime: string;
      threadCount: number;
      topMethods: Array<{
        name: string;
        avgTime: number;
      }>;
    }>(`SystemInfo?userId=${userId}`),

  getPermissionOverrides: (guildId: bigint) =>
    apiRequest<PermissionOverride[]>(`Permissions/dpo/${guildId}`),

  addPermissionOverride: (
    guildId: bigint,
    override: { command: string; permissions: bigint }
  ) =>
    apiRequest<PermissionOverride>(
      `Permissions/dpo/${guildId}`,
      "POST",
      override
    ),

  deletePermissionOverride: (guildId: bigint, command: string) =>
    apiRequest<void>(`Permissions/dpo/${guildId}`, "DELETE", command),

  enterGiveaway: (data: {
    guildId: bigint;
    giveawayId: number;
    userId: bigint;
    turnstileToken: string;
  }) => apiRequest<void>("entergiveaway/enter", "POST", data),

  getGiveaway: (giveawayId: string | number) =>
    apiRequest<Giveaways>(`giveaways/${giveawayId}`),

  getGiveaways: (guildId: bigint) =>
    apiRequest<Giveaways[]>(`giveaways/${guildId}`),

  createGiveaway: (guildId: bigint, giveaway: Partial<Giveaways>) =>
    apiRequest<Giveaways>(`giveaways/${guildId}`, "POST", giveaway),

  endGiveaway: (guildId: bigint, giveawayId: number) =>
    apiRequest<void>(`giveaways/${guildId}/${giveawayId}`, "PATCH"),

  submitBotReview: (review: Partial<BotReviews>) =>
    apiRequest<BotReviews>("reviews", "POST", review),

  getBotReviews: () => apiRequest<BotReviews[]>("reviews"),

  deleteBotReview: (reviewId: number) =>
    apiRequest<void>(`reviews/${reviewId}`, "DELETE"),

  getGuildTextChannels: (guildId: bigint) =>
    apiRequest<Array<{ id: string; name: string }>>(
      `ClientOperations/textchannels/${guildId}`
    ),

  getPlayerStatus: (guildId: bigint, userId: bigint) =>
    apiRequest<any>(`music/${guildId}/status?userId=${userId}`),

  pauseResume: (guildId: bigint) =>
    apiRequest<void>(`music/${guildId}/pause`, "POST"),

  setVolume: (guildId: bigint, volume: number) =>
    apiRequest<void>(`music/${guildId}/volume/${volume}`, "POST"),

  searchTracks: (guildId: bigint, query: string, platform: string = "youtube", limit: number = 10) =>
    apiRequest<{
      tracks: Array<{
        title: string;
        author: string;
        duration: string;
        uri: string;
        artworkUri: string;
        provider: string;
      }>
    }>(`Music/${guildId}/search?query=${encodeURIComponent(query)}&mode=${platform}&limit=${limit}`),

// Update this function as well for consistency
  extractTrack: (guildId: bigint, url: string) =>
    apiRequest<{
      title: string;
      author: string;
      duration: string;
      uri: string;
      artworkUri: string;
      provider: string;
    }>(`Music/${guildId}/extract?url=${encodeURIComponent(url)}`),

  playTrack: (guildId: bigint, playRequest: {
    url: string;
    requester: {
      Id: string | bigint;
      Username: string;
      AvatarUrl: string;
    }
  }) =>
    apiRequest<{
      track: any;
      position: number;
    }>(`Music/${guildId}/play`, "POST", playRequest),

  skipTrack: (guildId: bigint) =>
    apiRequest<void>(`music/${guildId}/skip`, "POST"),

  previousTrack: (guildId: bigint) =>
    apiRequest<void>(`music/${guildId}/previous`, "POST"),

  getMusicSettings: (guildId: bigint) =>
    apiRequest<any>(`music/${guildId}/settings`),

  updateMusicSettings: (guildId: bigint, settings: any) =>
    apiRequest<void>(`music/${guildId}/settings`, "POST", settings),

  clearQueue: (guildId: bigint) =>
    apiRequest<void>(`music/${guildId}/queue`, "DELETE"),

  shuffleQueue: (guildId: bigint) =>
    apiRequest<void>(`music/${guildId}/shuffle`, "POST"),

  setRepeatMode: (guildId: bigint, mode: string) =>
    apiRequest<void>(`music/${guildId}/repeat/${mode}`, "POST"),

  getInviteSettings: (guildId: bigint) =>
    apiRequest<{
      isEnabled: boolean;
      removeInviteOnLeave: boolean;
      minAccountAge: string;
    }>(`InviteTracking/${guildId}/settings`),

  toggleInviteTracking: (guildId: bigint, enabled: boolean) =>
    apiRequest<boolean>(`InviteTracking/${guildId}/toggle`, "POST", enabled),

  setRemoveOnLeave: (guildId: bigint, removeOnLeave: boolean) =>
    apiRequest<boolean>(`InviteTracking/${guildId}/remove-on-leave`, "POST", removeOnLeave),

  setMinAccountAge: (guildId: bigint, minAge: string) =>
    apiRequest<string>(`InviteTracking/${guildId}/min-age`, "POST", minAge),

  getInviteCount: (guildId: bigint, userId: bigint) =>
    apiRequest<number>(`InviteTracking/${guildId}/count/${userId}`),

  getInviter: (guildId: bigint, userId: bigint) =>
    apiRequest<{
      id: string;
      username: string;
      discriminator: string;
      avatarUrl: string;
    }>(`InviteTracking/${guildId}/inviter/${userId}`),

  getInvitedUsers: (guildId: bigint, userId: bigint) =>
    apiRequest<Array<{
      id: string;
      username: string;
      discriminator: string;
      avatarUrl: string;
    }>>(`InviteTracking/${guildId}/invited/${userId}`),

  getInviteLeaderboard: (guildId: bigint, page?: number, pageSize?: number) =>
    apiRequest<Array<{
      userId: string;
      username: string;
      inviteCount: number;
    }>>(`InviteTracking/${guildId}/leaderboard?page=${page || 1}&pageSize=${pageSize || 10}`),

  seek: (guildId: bigint, request: { Position: number }) =>
    apiRequest<void>(`music/${guildId}/seek`, "POST", request),

// Role States endpoints
  getRoleStateSettings: (guildId: bigint) =>
    apiRequest<{
      enabled: boolean;
      clearOnBan: boolean;
      ignoreBots: boolean;
      deniedRoles: string;
      deniedUsers: string;
    }>(`RoleStates/${guildId}/settings`),

  toggleRoleStates: (guildId: bigint) =>
    apiRequest<boolean>(`RoleStates/${guildId}/toggle`, "POST"),

  getUserRoleState: (guildId: bigint, userId: bigint) =>
    apiRequest<{
      userId: bigint;
      guildId: bigint;
      savedRoles: string;
      userName: string;
    }>(`RoleStates/${guildId}/user/${userId}`),

  getAllRoleStates: (guildId: bigint) =>
    apiRequest<Array<{
      userId: bigint;
      guildId: bigint;
      savedRoles: string;
      userName: string;
    }>>(`RoleStates/${guildId}/all`),

  addRolesToUser: (guildId: bigint, userId: bigint, roleIds: bigint[]) =>
    apiRequest<void>(`RoleStates/${guildId}/user/${userId}/roles`, "POST", roleIds),

  removeRolesFromUser: (guildId: bigint, userId: bigint, roleIds: bigint[]) =>
    apiRequest<void>(`RoleStates/${guildId}/user/${userId}/roles`, "DELETE", roleIds),

  deleteUserRoleState: (guildId: bigint, userId: bigint) =>
    apiRequest<void>(`RoleStates/${guildId}/user/${userId}`, "DELETE"),

  applyRoleState: (guildId: bigint, sourceUserId: bigint, targetUserId: bigint) =>
    apiRequest<void>(`RoleStates/${guildId}/user/${sourceUserId}/apply/${targetUserId}`, "POST"),

  setUserRoles: (guildId: bigint, userId: bigint, roleIds: bigint[]) =>
    apiRequest<void>(`RoleStates/${guildId}/user/${userId}/set-roles`, "POST", roleIds),

// Role Greet endpoints
  getRoleGreets: (guildId: bigint, roleId: bigint) =>
    apiRequest<Array<{
      id: number;
      guildId: bigint;
      roleId: bigint;
      channelId: bigint;
      message: string;
      deleteTime: number;
      webhookUrl: string | null;
      greetBots: boolean;
      disabled: boolean;
    }>>(`RoleGreet/${guildId}/role/${roleId}`),

  getAllRoleGreets: (guildId: bigint) =>
    apiRequest<Array<{
      id: number;
      guildId: bigint;
      roleId: bigint;
      channelId: bigint;
      message: string;
      deleteTime: number;
      webhookUrl: string | null;
      greetBots: boolean;
      disabled: boolean;
    }>>(`RoleGreet/${guildId}`),

  addRoleGreet: (guildId: bigint, roleId: bigint, channelId: bigint) =>
    apiRequest<void>(`RoleGreet/${guildId}/role/${roleId}`, "POST", channelId),

  updateRoleGreetMessage: (guildId: bigint, greetId: number, message: string) =>
    apiRequest<void>(`RoleGreet/${guildId}/${greetId}/message`, "PUT", message),

  updateRoleGreetDeleteTime: (guildId: bigint, greetId: number, seconds: number) =>
    apiRequest<void>(`RoleGreet/${guildId}/${greetId}/delete-time`, "PUT", seconds),

  updateRoleGreetWebhook: (guildId: bigint, greetId: number, webhookUrl: string | null) =>
    apiRequest<void>(`RoleGreet/${guildId}/${greetId}/webhook`, "PUT", { webhookUrl }),

  updateRoleGreetBots: (guildId: bigint, greetId: number, enabled: boolean) =>
    apiRequest<void>(`RoleGreet/${guildId}/${greetId}/greet-bots`, "PUT", enabled),

  disableRoleGreet: (guildId: bigint, greetId: number, disabled: boolean) =>
    apiRequest<void>(`RoleGreet/${guildId}/${greetId}/disable`, "PUT", disabled),

  getAverageJoins: (guildId: bigint) =>
    apiRequest<number>(`JoinLeave/${guildId}/average-joins`),

  getJoinStats: (guildId: bigint) =>
    apiRequest<GraphStatsResponse>(`JoinLeave/${guildId}/join-stats`),

  getLeaveStats: (guildId: bigint) =>
    apiRequest<GraphStatsResponse>(`JoinLeave/${guildId}/leave-stats`),

  setJoinColor: (guildId: bigint, color: number) =>
    apiRequest<void>(`JoinLeave/${guildId}/join-color`, "POST", color),

  setLeaveColor: (guildId: bigint, color: number) =>
    apiRequest<void>(`JoinLeave/${guildId}/leave-color`, "POST", color)
};
