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
  Starboard,
  SuggestionsModel
} from "$lib/types/models";
import type {
  ProtectionStats,
  AntiRaidSettings,
  AntiSpamSettings,
  AntiAltSettings,
  AntiMassMentionSettings
} from "$lib/types/protection";
import type {
  TodoList,
  TodoItem,
  TodoListPermission,
  CreateTodoListRequest,
  AddTodoItemRequest,
  UpdateTodoItemRequest,
  SetDueDateRequest,
  TagRequest,
  GrantPermissionRequest
} from "$lib/types/todo";
import JSONbig from "json-bigint";
import { logger } from "$lib/logger";
import type {
  Giveaways,
  PatreonAnalytics,
  PatreonConfig,
  PatreonConfigUpdateRequest,
  PatreonCreator,
  PatreonOAuthCallbackResponse,
  PatreonOAuthResponse,
  PatreonOAuthStatusResponse,
  PatreonOperationRequest,
  PatreonSupporter,
  PatreonTier,
  PatreonTierMappingRequest} from "$lib/types.ts";
import type {
  ChatSaveData,
  ClientUserInfo,
  MusicSettings,
  RoleStateSettings,
  XpSettings,
  XpTemplate
} from "$lib/types/xp.ts";
import type { MusicStatus, Track } from "$lib/types/music.ts";
import type {
  BirthdayConfig,
  BirthdayConfigRequest,
  BirthdayFeatures,
  BirthdayStats,
  BirthdayUser
} from "$lib/types/birthday.ts";
import type {
  CustomVoiceConfigurationResponse,
  CustomVoiceConfigurationRequest,
  CustomVoiceChannelResponse,
  UpdateCustomVoiceChannelRequest,
  CustomVoiceUserPreference
} from "$lib/types/customvoice.ts";
import type {
  LoggingConfigurationResponse,
  BulkUpdateLogChannelsRequest,
  SetIgnoredChannelsRequest,
  LogType
} from "$lib/types/logging.ts";
import type {
  AutomodRule,
  CreateAutomodRuleRequest,
  FilterStats
} from "$lib/types/filter.ts";
import type {
  UserMessageStats,
  ChannelMessageStats,
  HourlyMessageStats,
  MessageStatsResponse,
  MessageCountExportRequest
} from "$lib/types/messagestats.ts";
import type {
  SystemMetrics,
  PerformanceData,
  DatabaseMetrics,
  SystemHealthStatus
} from "$lib/types/system.ts";
import { currentInstance } from "$lib/stores/instanceStore.ts";
import { get } from "svelte/store";
import { PUBLIC_MEWDEKO_API_URL } from "$env/static/public";
import type { DiscordGuild } from "$lib/types/discordGuild.ts";
import type {
  AddButtonRequest, AddSelectMenuRequest, AddSelectOptionRequest, AddTagsRequest,
  BatchAddRoleRequest, BatchMoveTicketsRequest, BatchTransferTicketsRequest,
  BlacklistUserRequest, BlacklistedUserResponse, ClaimTicketRequest, CreateCaseRequest,
  CreatePanelRequest, CreatePriorityRequest, CreateTagRequest, GuildStatistics,
  PanelButton, PanelSelectMenu, PanelStatus, RecreateAllPanelsResponse, RemoveTagsRequest,
  SetChannelRequest, SetPriorityRequest, StaffResponseStats, Ticket, TicketActivity, 
  TicketCase, TicketPanel, TicketPriority, TicketTag, UpdateButtonRequest, UpdateCaseRequest, 
  UpdateEmbedRequest, UpdatePlaceholderRequest, UserStatistics
} from "$lib/types/tickets.ts";
import type {
  CountingChannelResponse,
  CountingConfigResponse,
  CountingStatsResponse,
  CountingUserStatsResponse,
  SavePointResponse,
  LeaderboardResponse,
  SetupCountingChannelRequest,
  UpdateCountingConfigRequest,
  ResetCountingChannelRequest,
  CreateSavePointRequest,
  RestoreSavePointRequest,
  BanUserRequest,
  UnbanUserRequest,
  SetCustomMessageRequest,
  SetMilestonesRequest,
  PurgeChannelRequest,
} from "$lib/types/counting.ts";
import { LeaderboardType } from "$lib/types/counting.ts";

// Reserved for future use - currently unused but kept for potential security checks
// const ALLOWED_ORIGINS = ["localhost", "127.0.0.1"];
// const ALLOWED_PORTS = new Set(["3000", "5173"]);

async function apiRequest<T>(
  endpoint: string,
  method: string = "GET",
  body?: unknown,
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
    body: body ? JSONbig.stringify(body) : null
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

  // Event Handler Metrics
  getEventMetrics: (userId: bigint) =>
    apiRequest<Array<{
      eventType: string;
      totalProcessed: number;
      totalErrors: number;
      totalExecutionTime: number;
      averageExecutionTime: number;
      errorRate: number;
    }>>(`Performance/events?userId=${userId}`),

  getModuleMetrics: (userId: bigint) =>
    apiRequest<Array<{
      moduleName: string;
      eventsProcessed: number;
      errors: number;
      totalExecutionTime: number;
      averageExecutionTime: number;
      errorRate: number;
    }>>(`Performance/modules?userId=${userId}`),

  // XP Management endpoints
  getXpSettings: (guildId: bigint) =>
    apiRequest<XpSettings>(`xp/${guildId}/settings`),

  updateXpSettings: (guildId: bigint, settings: XpSettings) =>
    apiRequest<XpSettings>(`xp/${guildId}/settings`, "POST", settings),

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
    apiRequest<XpTemplate>(`xp/${guildId}/template`),

  updateXpTemplate: (guildId: bigint, template: XpTemplate) =>
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
      messages: ChatSaveData["messages"];
    }>(
      `Chat/${guildId}/logs/${logId}`
    ),

  saveChatLog: (guildId: bigint, data: {
    channelId: bigint;
    name: string;
    createdBy: bigint;
    messages: ChatSaveData["messages"];
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
      isBot: boolean;
    }>>(
      `ClientOperations/members/${guildId}`
    ),


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
  afkTimeoutSet: (guildId: bigint, timeout: string) =>
    apiRequest<void>(`afk/${guildId}/timeout`, "POST", timeout),
  getDisabledAfkChannels: (guildId: bigint) =>
    apiRequest<string | null>(`afk/${guildId}/disabled-channels`),
  setDisabledAfkChannels: (guildId: bigint, channels: string) =>
    apiRequest<void>(`afk/${guildId}/disabled-channels`, "POST", channels),
  getCustomAfkMessage: (guildId: bigint) =>
    apiRequest<string>(`afk/${guildId}/custom-message`),
  setCustomAfkMessage: (guildId: bigint, message: string) =>
    apiRequest<void>(`afk/${guildId}/custom-message`, "POST", message),

  getBotInstances: () =>
    apiRequest<BotInstance[]>("InstanceManagement"),

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

  getGuildChannels: (guildId: bigint, type?: number | undefined) =>
    apiRequest<Array<{ id: string; name: string; type: number }>>(
      `ClientOperations/channels/${guildId}/${!type ? 4 : type}`
    ),

  getTicketPanels: (guildId: bigint) =>
      apiRequest<TicketPanel[]>(`ticket/${guildId}/panels`),

    createTicketPanel: (
      guildId: bigint,
      panel: CreatePanelRequest
    ) =>
      apiRequest<void>(`ticket/${guildId}/panels`, "POST", panel),

    deleteTicketPanel: (guildId: bigint, panelId: bigint) =>
      apiRequest<void>(`ticket/${guildId}/panels/${panelId}`, "DELETE"),

    updateTicketPanelEmbed: (
      guildId: bigint,
      panelId: number,
      embed: UpdateEmbedRequest
    ) =>
      apiRequest<void>(`ticket/${guildId}/panels/${panelId}/embed`, "PUT", embed),

    moveTicketPanel: (
      guildId: bigint,
      panelId: number,
      channelId: bigint
    ) =>
      apiRequest<void>(`ticket/${guildId}/panels/${panelId}/move`, "PUT", { channelId }),

    duplicateTicketPanel: (guildId: bigint, panelId: number) =>
      apiRequest<void>(`ticket/${guildId}/panels/${panelId}/duplicate`, "POST"),

    recreateTicketPanel: (guildId: bigint, panelId: number) =>
      apiRequest<void>(`ticket/${guildId}/panels/${panelId}/recreate`, "POST"),

    getPanelStatus: (guildId: bigint) =>
      apiRequest<PanelStatus[]>(`ticket/${guildId}/panels/status`),

    recreateAllPanels: (guildId: bigint) =>
      apiRequest<RecreateAllPanelsResponse>(`ticket/${guildId}/panels/recreate-all`, "POST"),

  // Button Management
    getPanelButtons: (guildId: bigint, panelId: number) =>
      apiRequest<PanelButton[]>(`ticket/${guildId}/panels/${panelId}/buttons`),

    addPanelButton: (
      guildId: bigint,
      panelId: number,
      button: AddButtonRequest
    ) =>
      apiRequest<void>(`ticket/${guildId}/panels/${panelId}/buttons`, "POST", button),

    getButton: (guildId: bigint, buttonId: number) =>
      apiRequest<PanelButton>(`ticket/${guildId}/buttons/${buttonId}`),

    updateButton: (
      guildId: bigint,
      buttonId: number,
      button: UpdateButtonRequest
    ) =>
      apiRequest<void>(`ticket/${guildId}/buttons/${buttonId}`, "PUT", button),

    deleteButton: (guildId: bigint, buttonId: number) =>
      apiRequest<void>(`ticket/${guildId}/buttons/${buttonId}`, "DELETE"),

  // Select Menu Management
    getPanelSelectMenus: (guildId: bigint, panelId: number) =>
      apiRequest<PanelSelectMenu[]>(`ticket/${guildId}/panels/${panelId}/selectmenus`),

    addPanelSelectMenu: (
      guildId: bigint,
      panelId: number,
      menu: AddSelectMenuRequest
    ) =>
      apiRequest<void>(`ticket/${guildId}/panels/${panelId}/selectmenus`, "POST", menu),

    updateSelectMenuPlaceholder: (
      guildId: bigint,
      menuId: number,
      request: UpdatePlaceholderRequest
    ) =>
      apiRequest<void>(`ticket/${guildId}/selectmenus/${menuId}/placeholder`, "PUT", request),

    addSelectMenuOption: (
      guildId: bigint,
      menuId: number,
      option: AddSelectOptionRequest
    ) =>
      apiRequest<void>(`ticket/${guildId}/selectmenus/${menuId}/options`, "POST", option),

    deleteSelectMenu: (guildId: bigint, menuId: number) =>
      apiRequest<void>(`ticket/${guildId}/selectmenus/${menuId}`, "DELETE"),

    deleteSelectMenuOption: (guildId: bigint, optionId: number) =>
      apiRequest<void>(`ticket/${guildId}/selectmenus/options/${optionId}`, "DELETE"),

  // Ticket Management
    getTicket: (guildId: bigint, ticketId: number) =>
      apiRequest<Ticket>(`ticket/${guildId}/tickets/${ticketId}`),

    getTicketByChannel: (guildId: bigint, channelId: bigint) =>
      apiRequest<Ticket>(`ticket/${guildId}/tickets/by-channel/${channelId}`),

    claimTicket: (guildId: bigint, channelId: bigint, request: ClaimTicketRequest) =>
      apiRequest<void>(`ticket/${guildId}/tickets/by-channel/${channelId}/claim`, "POST", request),

    unclaimTicket: (guildId: bigint, channelId: bigint) =>
      apiRequest<void>(`ticket/${guildId}/tickets/by-channel/${channelId}/unclaim`, "POST"),

    closeTicket: (
      guildId: bigint,
      channelId: bigint,
      reason?: string
    ) =>
      apiRequest<void>(`ticket/${guildId}/tickets/by-channel/${channelId}/close`, "POST", { reason }),

    archiveTicket: (guildId: bigint, ticketId: number) =>
      apiRequest<void>(`ticket/${guildId}/tickets/${ticketId}/archive`, "POST"),

    setTicketPriority: (
      guildId: bigint,
      channelId: bigint,
      request: SetPriorityRequest
    ) =>
      apiRequest<void>(`ticket/${guildId}/tickets/by-channel/${channelId}/priority`, "POST", request),

    addTicketTags: (
      guildId: bigint,
      channelId: bigint,
      request: AddTagsRequest
    ) =>
      apiRequest<void>(`ticket/${guildId}/tickets/by-channel/${channelId}/tags`, "POST", request),

    removeTicketTags: (
      guildId: bigint,
      channelId: bigint,
      request: RemoveTagsRequest
    ) =>
      apiRequest<void>(`ticket/${guildId}/tickets/by-channel/${channelId}/tags`, "DELETE", request),

    addTicketNotes: (
      guildId: bigint,
      channelId: bigint,
      notes: string
    ) =>
      apiRequest<void>(`ticket/${guildId}/tickets/by-channel/${channelId}/notes`, "POST", { notes }),

  // Case Management
    getTicketCases: (guildId: bigint) =>
      apiRequest<TicketCase[]>(`ticket/${guildId}/cases`),

    getTicketCase: (guildId: bigint, caseId: number) =>
      apiRequest<TicketCase>(`ticket/${guildId}/cases/${caseId}`),

    createTicketCase: (
      guildId: bigint,
      ticketCase: CreateCaseRequest
    ) =>
      apiRequest<void>(`ticket/${guildId}/cases`, "POST", ticketCase),

    updateTicketCase: (
      guildId: bigint,
      caseId: number,
      ticketCase: UpdateCaseRequest
    ) =>
      apiRequest<void>(`ticket/${guildId}/cases/${caseId}`, "PUT", ticketCase),

    closeTicketCase: (guildId: bigint, caseId: number) =>
      apiRequest<void>(`ticket/${guildId}/cases/${caseId}/close`, "POST"),

    reopenTicketCase: (guildId: bigint, caseId: number) =>
      apiRequest<void>(`ticket/${guildId}/cases/${caseId}/reopen`, "POST"),

    linkTicketsToCase: (
      guildId: bigint,
      caseId: number,
      ticketIds: number[]
    ) =>
      apiRequest<void>(`ticket/${guildId}/cases/${caseId}/link-tickets`, "POST", { ticketIds }),

    unlinkTickets: (
      guildId: bigint,
      ticketIds: number[]
    ) =>
      apiRequest<void>(`ticket/${guildId}/unlink-tickets`, "POST", { ticketIds }),

    addCaseNotes: (
      guildId: bigint,
      caseId: number,
      notes: string
    ) =>
      apiRequest<void>(`ticket/${guildId}/cases/${caseId}/notes`, "POST", { notes }),

  // Statistics
    getTicketStats: (guildId: bigint) =>
      apiRequest<GuildStatistics>(`ticket/${guildId}/statistics`),

    getUserTicketStats: (guildId: bigint, userId: bigint) =>
      apiRequest<UserStatistics>(`ticket/${guildId}/statistics/users/${userId}`),

    getTicketActivity: (guildId: bigint, days?: number) =>
      apiRequest<TicketActivity[]>(`ticket/${guildId}/statistics/activity${days ? `?days=${days}` : ""}`),

    getStaffResponseStats: (guildId: bigint) =>
      apiRequest<StaffResponseStats[]>(`ticket/${guildId}/statistics/staff-response`),

  // Priority Management
    getTicketPriorities: (guildId: bigint) =>
      apiRequest<TicketPriority[]>(`ticket/${guildId}/priorities`),

    createTicketPriority: (
      guildId: bigint,
      priority: CreatePriorityRequest
    ) =>
      apiRequest<void>(`ticket/${guildId}/priorities`, "POST", priority),

    deleteTicketPriority: (guildId: bigint, priorityId: number) =>
      apiRequest<void>(`ticket/${guildId}/priorities/${priorityId}`, "DELETE"),

  // Tag Management
    getTicketTags: (guildId: bigint) =>
      apiRequest<TicketTag[]>(`ticket/${guildId}/tags`),

    createTicketTag: (
      guildId: bigint,
      tag: CreateTagRequest
    ) =>
      apiRequest<void>(`ticket/${guildId}/tags`, "POST", tag),

    deleteTicketTag: (guildId: bigint, tagId: number) =>
      apiRequest<void>(`ticket/${guildId}/tags/${tagId}`, "DELETE"),

  // Blacklist Management
    getTicketBlacklist: (guildId: bigint) =>
      apiRequest<BlacklistedUserResponse[]>(`ticket/${guildId}/blacklist`),

    blacklistUser: (
      guildId: bigint,
      userId: bigint,
      request: BlacklistUserRequest
    ) =>
      apiRequest<void>(`ticket/${guildId}/blacklist/${userId}`, "POST", request),

    unblacklistUser: (guildId: bigint, userId: bigint) =>
      apiRequest<void>(`ticket/${guildId}/blacklist/${userId}`, "DELETE"),

  // Batch Operations
    closeInactiveTickets: (
      guildId: bigint,
      inactiveHours: number
    ) =>
      apiRequest<void>(`ticket/${guildId}/batch/close-inactive`, "POST", { inactiveHours }),

    moveTicketsBatch: (
      guildId: bigint,
      request: BatchMoveTicketsRequest
    ) =>
      apiRequest<void>(`ticket/${guildId}/batch/move-tickets`, "POST", request),

    addRoleBatch: (
      guildId: bigint,
      request: BatchAddRoleRequest
    ) =>
      apiRequest<void>(`ticket/${guildId}/batch/add-role`, "POST", request),

    transferTicketsBatch: (
      guildId: bigint,
      request: BatchTransferTicketsRequest
    ) =>
      apiRequest<void>(`ticket/${guildId}/batch/transfer-tickets`, "POST", request),

  // Settings
    setTicketTranscriptChannel: (guildId: bigint, request: SetChannelRequest) =>
      apiRequest<void>(`ticket/${guildId}/settings/transcript-channel`, "PUT", request),

    setTicketLogChannel: (guildId: bigint, request: SetChannelRequest) =>
      apiRequest<void>(`ticket/${guildId}/settings/log-channel`, "PUT", request),

// Additional Helper Methods
  getGuildCategories: (guildId: bigint) =>
    apiRequest<Array<{ id: string; name: string }>>(
      `ClientOperations/categories/${guildId}`
    ),

  getUser: (guildId: bigint, userId: bigint) =>
    apiRequest<ClientUserInfo>(`ClientOperations/user/${guildId}/${userId}`),

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

  // Guild Information
  getGuildInfo: (guildId: bigint) =>
    apiRequest<import("$lib/types/discordGuild").GuildInfo>(`guild/${guildId}/info`),

  getGuildTextChannels: (guildId: bigint) =>
    apiRequest<Array<{ id: string; name: string }>>(
      `ClientOperations/textchannels/${guildId}`
    ),

  getForumChannels: (guildId: bigint) =>
    apiRequest<Array<{
      id: bigint;
      name: string;
      topic: string | null;
      requiresTags: boolean;
      maxActiveThreads: number | null;
      defaultAutoArchiveDuration: number;
      tags: Array<{
        id: bigint;
        name: string;
        emoji: string | null;
        isModerated: boolean;
      }>;
      activeThreads: Array<{
        id: bigint;
        name: string;
        appliedTags: bigint[];
        creatorId: bigint;
        createdAt: string;
        messageCount: number;
        isArchived: boolean;
        isLocked: boolean;
      }>;
      totalThreadCount: number;
    }>>(
      `ClientOperations/forumchannels/${guildId}`
    ),

  getForumChannel: (guildId: bigint, forumId: bigint) =>
    apiRequest<{
      id: bigint;
      name: string;
      topic: string | null;
      requiresTags: boolean;
      maxActiveThreads: number | null;
      defaultAutoArchiveDuration: number;
      tags: Array<{
        id: bigint;
        name: string;
        emoji: string | null;
        isModerated: boolean;
      }>;
      activeThreads: Array<{
        id: bigint;
        name: string;
        appliedTags: bigint[];
        creatorId: bigint;
        createdAt: string;
        messageCount: number;
        isArchived: boolean;
        isLocked: boolean;
      }>;
      totalThreadCount: number;
    }>(`ClientOperations/forumchannel/${guildId}/${forumId}`),

  getForumThreads: (guildId: bigint, forumId: bigint, includeArchived: boolean = false) =>
    apiRequest<Array<{
      id: bigint;
      name: string;
      appliedTags: bigint[];
      creatorId: bigint;
      createdAt: string;
      messageCount: number;
      isArchived: boolean;
      isLocked: boolean;
    }>>(`ClientOperations/forumthreads/${guildId}/${forumId}?includeArchived=${includeArchived}`),

  getGuildVoiceChannels: (guildId: bigint) =>
    apiRequest<Array<{ id: string; name: string }>>(
      `ClientOperations/channels/${guildId}/2`
    ),

  getGuildChannelsByType: (guildId: bigint, channelType: number) =>
    apiRequest<Array<{ id: string; name: string }>>(
      `ClientOperations/channels/${guildId}/${channelType}`
    ),

  getPlayerStatus: (guildId: bigint, userId: bigint) =>
    apiRequest<MusicStatus>(`music/${guildId}/status?userId=${userId}`),

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
      Id: bigint;
      Username: string;
      AvatarUrl: string;
    }
  }) =>
    apiRequest<{
      track: Track;
      position: number;
    }>(`Music/${guildId}/play`, "POST", playRequest),

  skipTrack: (guildId: bigint) =>
    apiRequest<void>(`music/${guildId}/skip`, "POST"),

  previousTrack: (guildId: bigint) =>
    apiRequest<void>(`music/${guildId}/previous`, "POST"),

  getMusicSettings: (guildId: bigint) =>
    apiRequest<MusicSettings>(`music/${guildId}/settings`),

  updateMusicSettings: (guildId: bigint, settings: MusicSettings) =>
    apiRequest<void>(`music/${guildId}/settings`, "POST", settings),

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

  toggleClearOnBan: (guildId: bigint, roleStateSettings: RoleStateSettings) =>
    apiRequest<boolean>(`RoleStates/${guildId}/clear-on-ban`, "POST", {
      clearOnBan: !roleStateSettings.clearOnBan
    }),

  toggleIgnoreBots: (guildId: bigint, roleStateSettings: RoleStateSettings) =>
    apiRequest<boolean>(`RoleStates/${guildId}/ignore-bots`, "POST", {
      ignoreBots: !roleStateSettings.ignoreBots
    }),

  updateRoleStateSettings: (guildId: bigint, settings: RoleStateSettings) =>
    apiRequest<void>(`RoleStates/${guildId}/settings`, "POST", settings),

  saveAllUserRoleStates: (guildId: bigint) =>
    apiRequest<{
      savedCount: number;
      errorMessage: string;
    }>(`RoleStates/${guildId}/save-all`, "POST"),

// Role Greet endpoints
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

  getStarboards: (guildId: bigint) =>
    apiRequest<Array<Starboard>>(`Starboard/${guildId}/all`),

  createStarboard: (guildId: bigint, channelId: bigint, emote: string, threshold: number) =>
    apiRequest<number>(`Starboard/${guildId}`, "POST", { channelId, emote, threshold }),

  deleteStarboard: (guildId: bigint, starboardId: number) =>
    apiRequest<void>(`Starboard/${guildId}/${starboardId}`, "DELETE"),

  setAllowBots: (guildId: bigint, starboardId: number, allowed: boolean) =>
    apiRequest<boolean>(`Starboard/${guildId}/${starboardId}/allow-bots`, "POST", allowed),

  setRemoveOnDelete: (guildId: bigint, starboardId: number, removeOnDelete: boolean) =>
    apiRequest<boolean>(`Starboard/${guildId}/${starboardId}/remove-on-delete`, "POST", removeOnDelete),

  setRemoveOnClear: (guildId: bigint, starboardId: number, removeOnClear: boolean) =>
    apiRequest<boolean>(`Starboard/${guildId}/${starboardId}/remove-on-clear`, "POST", removeOnClear),

  setRemoveBelowThreshold: (guildId: bigint, starboardId: number, removeBelowThreshold: boolean) =>
    apiRequest<boolean>(`Starboard/${guildId}/${starboardId}/remove-below-threshold`, "POST", removeBelowThreshold),

  setRepostThreshold: (guildId: bigint, starboardId: number, threshold: number) =>
    apiRequest<number>(`Starboard/${guildId}/${starboardId}/repost-threshold`, "POST", threshold),

  setStarThreshold: (guildId: bigint, starboardId: number, threshold: number) =>
    apiRequest<number>(`Starboard/${guildId}/${starboardId}/star-threshold`, "POST", threshold),

  setUseBlacklist: (guildId: bigint, starboardId: number, useBlacklist: boolean) =>
    apiRequest<boolean>(`Starboard/${guildId}/${starboardId}/use-blacklist`, "POST", useBlacklist),

  toggleChannel: (guildId: bigint, starboardId: number, channelId: bigint) =>
    apiRequest<{
      wasAdded: boolean;
      config: Starboard
    }>(`Starboard/${guildId}/${starboardId}/toggle-channel`, "POST", channelId),

  getStarboardHighlights: (guildId: bigint, limit: number = 5) =>
    apiRequest<Array<{
      messageId: bigint;
      channelId: bigint;
      starCount: number;
      content: string;
      authorName: string;
      authorAvatarUrl?: string;
      imageUrl?: string;
      starEmote: string;
      createdAt: string;
    }>>(`Starboard/${guildId}/highlights?limit=${limit}`),

  // Patreon endpoints
  getPatreonOAuthUrl: (guildId: bigint) => {
    return apiRequest<PatreonOAuthResponse>(`patreon/oauth/url?guildId=${guildId}`);
  },

  handlePatreonOAuthCallback: (code: string, state: string, error?: string) => {
    return apiRequest<PatreonOAuthCallbackResponse>(`patreon/oauth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}${error ? `&error=${encodeURIComponent(error)}` : ""}`);
  },

    getPatreonOAuthStatus: (guildId: bigint) =>
      apiRequest<PatreonOAuthStatusResponse>(`patreon/oauth/status?guildId=${guildId}`),

    getPatreonAnalytics: (guildId: bigint) =>
      apiRequest<PatreonAnalytics>(`patreon/analytics?guildId=${guildId}`),

    getPatreonSupporters: (guildId: bigint) =>
      apiRequest<PatreonSupporter[]>(`patreon/supporters?guildId=${guildId}`),

    getPatreonConfig: (guildId: bigint) =>
      apiRequest<PatreonConfig>(`patreon/config?guildId=${guildId}`),

    updatePatreonConfig: (guildId: bigint, config: PatreonConfigUpdateRequest) =>
      apiRequest<PatreonConfig>(`patreon/config?guildId=${guildId}`, "POST", config),

    getPatreonTiers: (guildId: bigint) =>
      apiRequest<PatreonTier[]>(`patreon/tiers?guildId=${guildId}`),

    getPatreonCreator: (guildId: bigint) =>
      apiRequest<PatreonCreator>(`patreon/creator?guildId=${guildId}`),


    triggerPatreonOperation: (guildId: bigint, operation: PatreonOperationRequest) =>
      apiRequest<{ message: string }>(`patreon/operations?guildId=${guildId}`, "POST", operation),

    mapPatreonTierToRole: (guildId: bigint, mapping: PatreonTierMappingRequest) =>
      apiRequest<{ message: string }>(`patreon/tiers/map?guildId=${guildId}`, "POST", mapping),

    disconnectPatreon: (guildId: bigint) =>
      apiRequest<{ message: string }>(`patreon/oauth/disconnect?guildId=${guildId}`, "DELETE"),

  // Moderation endpoints
  getWarnings: (guildId: bigint) =>
    apiRequest<Array<{
      id: number;
      guildId: bigint;
      userId: bigint;
      reason: string | null;
      forgiven: boolean;
      forgivenBy: string | null;
      moderator: string | null;
      dateAdded: string | null;
    }>>(`Moderation/${guildId}/warnings`),

  getRecentModerationActivity: (guildId: bigint, limit: number = 20) =>
    apiRequest<Array<{
      id: number;
      guildId: bigint;
      userId: bigint;
      reason: string | null;
      forgiven: boolean;
      forgivenBy: string | null;
      moderator: string | null;
      dateAdded: string | null;
    }>>(`Moderation/${guildId}/recent?limit=${limit}`),

  // Administration endpoints
  getAutoAssignRoles: (guildId: bigint) =>
    apiRequest<{
      normalRoles: bigint[];
      botRoles: bigint[];
    }>(`Administration/${guildId}/auto-assign-roles`),

  setAutoAssignRoles: (guildId: bigint, roleIds: bigint[]) =>
    apiRequest<void>(`Administration/${guildId}/auto-assign-roles/normal`, "POST", roleIds),

  setBotAutoAssignRoles: (guildId: bigint, roleIds: bigint[]) =>
    apiRequest<void>(`Administration/${guildId}/auto-assign-roles/bots`, "POST", roleIds),

  toggleAutoAssignRole: (guildId: bigint, roleId: bigint) =>
    apiRequest<bigint[]>(`Administration/${guildId}/auto-assign-roles/normal/${roleId}/toggle`, "POST"),

  toggleBotAutoAssignRole: (guildId: bigint, roleId: bigint) =>
    apiRequest<bigint[]>(`Administration/${guildId}/auto-assign-roles/bots/${roleId}/toggle`, "POST"),

  getProtectionStatus: (guildId: bigint) =>
    apiRequest<{
      antiRaid: {
        enabled: boolean;
        userThreshold: number;
        seconds: number;
        action: number;
        punishDuration: number;
        usersCount: number;
      };
      antiSpam: {
        enabled: boolean;
        messageThreshold: number;
        action: number;
        muteTime: number;
        roleId: bigint;
        userCount: number;
      };
      antiAlt: {
        enabled: boolean;
        minAge: string;
        action: number;
        actionDuration: number;
        roleId: bigint;
        counter: number;
      };
      antiMassMention: {
        enabled: boolean;
        mentionThreshold: number;
        maxMentionsInTimeWindow: number;
        timeWindowSeconds: number;
        action: number;
        muteTime: number;
        roleId: bigint;
        ignoreBots: boolean;
        userCount: number;
      };
    }>(`Administration/${guildId}/protection/status`),

  startAntiRaid: (guildId: bigint, userThreshold: number, seconds: number, action: number) =>
    apiRequest<void>(`Administration/${guildId}/protection/anti-raid/start`, "POST", {
      userThreshold,
      seconds,
      action
    }),

  stopAntiRaid: (guildId: bigint) =>
    apiRequest<{ success: boolean }>(`Administration/${guildId}/protection/anti-raid/stop`, "POST"),

  startAntiSpam: (guildId: bigint, messageCount: number, action: number, roleId: bigint) =>
    apiRequest<void>(`Administration/${guildId}/protection/anti-spam/start`, "POST", {
      messageCount,
      action,
      roleId
    }),

  stopAntiSpam: (guildId: bigint) =>
    apiRequest<{ success: boolean }>(`Administration/${guildId}/protection/anti-spam/stop`, "POST"),

  // Enhanced Protection API endpoints
  updateAntiRaidSettings: (guildId: bigint, settings: Partial<AntiRaidSettings>) =>
    apiRequest<void>(`Administration/${guildId}/protection/anti-raid/settings`, "PUT", settings),

  updateAntiSpamSettings: (guildId: bigint, settings: Partial<AntiSpamSettings>) =>
    apiRequest<void>(`Administration/${guildId}/protection/anti-spam/settings`, "PUT", settings),

  updateAntiAltSettings: (guildId: bigint, settings: Partial<AntiAltSettings>) =>
    apiRequest<void>(`Administration/${guildId}/protection/anti-alt/settings`, "PUT", settings),

  updateAntiMassMentionSettings: (guildId: bigint, settings: Partial<AntiMassMentionSettings>) =>
    apiRequest<void>(`Administration/${guildId}/protection/anti-mass-mention/settings`, "PUT", settings),

  getProtectionStats: (guildId: bigint) =>
    apiRequest<ProtectionStats>(`Administration/${guildId}/protection/stats`),

  addAntiSpamIgnoredChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(`Administration/${guildId}/protection/anti-spam/ignored-channels`, "POST", { channelId }),

  removeAntiSpamIgnoredChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(`Administration/${guildId}/protection/anti-spam/ignored-channels/${channelId}`, "DELETE"),

  addAntiSpamIgnoredUser: (guildId: bigint, userId: bigint) =>
    apiRequest<void>(`Administration/${guildId}/protection/anti-spam/ignored-users`, "POST", { userId }),

  removeAntiSpamIgnoredUser: (guildId: bigint, userId: bigint) =>
    apiRequest<void>(`Administration/${guildId}/protection/anti-spam/ignored-users/${userId}`, "DELETE"),

  startAntiAlt: (guildId: bigint, minAge: string, action: number, actionDuration: number, roleId?: bigint) =>
    apiRequest<void>(`Administration/${guildId}/protection/anti-alt/start`, "POST", {
      minAge,
      action,
      actionDuration,
      roleId
    }),

  stopAntiAlt: (guildId: bigint) =>
    apiRequest<{ success: boolean }>(`Administration/${guildId}/protection/anti-alt/stop`, "POST"),

  startAntiMassMention: (guildId: bigint, mentionThreshold: number, timeWindowSeconds: number, action: number, muteTime?: number, roleId?: bigint) =>
    apiRequest<void>(`Administration/${guildId}/protection/anti-mass-mention/start`, "POST", {
      mentionThreshold,
      timeWindowSeconds,
      action,
      muteTime,
      roleId
    }),

  stopAntiMassMention: (guildId: bigint) =>
    apiRequest<{ success: boolean }>(`Administration/${guildId}/protection/anti-mass-mention/stop`, "POST"),

  // New Protection Controller endpoints
  configureProtection: (guildId: bigint, protectionType: string, config: any) =>
    apiRequest<any>(`Protection/${guildId}/${protectionType}`, "PUT", config),

  toggleAntiSpamIgnoredChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<{ added: boolean; ignoredChannels: bigint[] }>(`Protection/${guildId}/anti-spam/ignored-channels/${channelId}`, "POST"),

  getProtectionStatistics: (guildId: bigint) =>
    apiRequest<ProtectionStats>(`Protection/${guildId}/statistics`),

  // New Administration Controller Protection Endpoints
  configureAntiRaid: (guildId: bigint, config: {
    enabled: boolean;
    userThreshold?: number;
    seconds?: number;
    action?: string;
    punishDuration?: number;
  }) =>
    apiRequest<void>(`Administration/${guildId}/protection/anti-raid`, "PUT", {
      Enabled: config.enabled,
      UserThreshold: config.userThreshold,
      Seconds: config.seconds,
      Action: config.action,
      PunishDuration: config.punishDuration
    }),

  configureAntiSpam: (guildId: bigint, config: {
    enabled: boolean;
    messageThreshold?: number;
    action?: string;
    muteTime?: number;
    roleId?: bigint;
  }) =>
    apiRequest<void>(`Administration/${guildId}/protection/anti-spam`, "PUT", {
      Enabled: config.enabled,
      MessageThreshold: config.messageThreshold,
      Action: config.action,
      MuteTime: config.muteTime,
      RoleId: config.roleId
    }),

  configureAntiAlt: (guildId: bigint, config: {
    enabled: boolean;
    minAgeMinutes: number;
    action: string;
    actionDurationMinutes: number;
    roleId?: bigint;
  }) =>
    apiRequest<void>(`Administration/${guildId}/protection/anti-alt`, "PUT", {
      Enabled: config.enabled,
      MinAgeMinutes: config.minAgeMinutes,
      Action: config.action,
      ActionDurationMinutes: config.actionDurationMinutes,
      RoleId: config.roleId
    }),

  configureAntiMassMention: (guildId: bigint, config: {
    enabled: boolean;
    mentionThreshold: number;
    timeWindowSeconds: number;
    maxMentionsInTimeWindow: number;
    ignoreBots: boolean;
    action: string;
    muteTime: number;
    roleId?: bigint;
  }) =>
    apiRequest<void>(`Administration/${guildId}/protection/anti-mass-mention`, "PUT", {
      Enabled: config.enabled,
      MentionThreshold: config.mentionThreshold,
      TimeWindowSeconds: config.timeWindowSeconds,
      MaxMentionsInTimeWindow: config.maxMentionsInTimeWindow,
      IgnoreBots: config.ignoreBots,
      Action: config.action,
      MuteTime: config.muteTime,
      RoleId: config.roleId
    }),

  // Anti-Pattern Protection endpoints
  configureAntiPattern: (guildId: bigint, config: {
    enabled: boolean;
    action?: number;
    punishDuration?: number;
    roleId?: bigint;
    checkAccountAge?: boolean;
    maxAccountAgeMonths?: number;
    checkJoinTiming?: boolean;
    maxJoinHours?: number;
    checkBatchCreation?: boolean;
    checkOfflineStatus?: boolean;
    checkNewAccounts?: boolean;
    newAccountDays?: number;
    minimumScore?: number;
  }) =>
    apiRequest<any>(`Protection/${guildId}/anti-pattern`, "PUT", {
      Enabled: config.enabled,
      Action: config.action,
      PunishDuration: config.punishDuration,
      RoleId: config.roleId,
      CheckAccountAge: config.checkAccountAge,
      MaxAccountAgeMonths: config.maxAccountAgeMonths,
      CheckJoinTiming: config.checkJoinTiming,
      MaxJoinHours: config.maxJoinHours,
      CheckBatchCreation: config.checkBatchCreation,
      CheckOfflineStatus: config.checkOfflineStatus,
      CheckNewAccounts: config.checkNewAccounts,
      NewAccountDays: config.newAccountDays,
      MinimumScore: config.minimumScore
    }),

  addAntiPatternPattern: (guildId: bigint, pattern: string, name: string, checkUsername: boolean, checkDisplayName: boolean) =>
    apiRequest<{ success: boolean }>(`Protection/${guildId}/anti-pattern/patterns`, "POST", {
      pattern,
      name,
      checkUsername,
      checkDisplayName
    }),

  removeAntiPatternPattern: (guildId: bigint, patternId: number) =>
    apiRequest<{ success: boolean }>(`Protection/${guildId}/anti-pattern/patterns/${patternId}`, "DELETE"),

  updateAntiPatternConfig: (guildId: bigint, config: {
    checkAccountAge?: boolean;
    maxAccountAgeMonths?: number;
    checkJoinTiming?: boolean;
    maxJoinHours?: number;
    checkBatchCreation?: boolean;
    checkOfflineStatus?: boolean;
    checkNewAccounts?: boolean;
    newAccountDays?: number;
    minimumScore?: number;
  }) =>
    apiRequest<{ success: boolean }>(`Protection/${guildId}/anti-pattern/config`, "PATCH", {
      CheckAccountAge: config.checkAccountAge,
      MaxAccountAgeMonths: config.maxAccountAgeMonths,
      CheckJoinTiming: config.checkJoinTiming,
      MaxJoinHours: config.maxJoinHours,
      CheckBatchCreation: config.checkBatchCreation,
      CheckOfflineStatus: config.checkOfflineStatus,
      CheckNewAccounts: config.checkNewAccounts,
      NewAccountDays: config.newAccountDays,
      MinimumScore: config.minimumScore
    }),

  getAntiPatternPatterns: (guildId: bigint) =>
    apiRequest<Array<{ id: number; name: string; pattern: string; checkUsername: boolean; checkDisplayName: boolean; }>>(`Protection/${guildId}/anti-pattern/patterns`),

  resetPermissionOverrides: (guildId: bigint) =>
    apiRequest<void>(`Administration/${guildId}/permissions/overrides/reset`, "POST"),

  setPermissionRole: (guildId: bigint, roleId: string) =>
    apiRequest<void>(`Administration/${guildId}/permissions/role`, "POST", roleId),

  getCommandsAndModules: () =>
    apiRequest<Array<{ name: string; commands: Array<{ commandName: string; description: string; example: string[]; guildUserPermissions: string; channelUserPermissions: string; guildBotPermissions: string; channelBotPermissions: string; isDragon: boolean }> }>>(`Administration/0/commands`),

  massBan: (guildId: bigint, userIds: bigint[], reason?: string) =>
    apiRequest<{ succeeded: number; failed: number }>(`Administration/${guildId}/mass-ban`, "POST", { userIds, reason }),

  getCommandCooldowns: (guildId: bigint) =>
    apiRequest<Array<{ commandName: string; seconds: number }>>(`Administration/${guildId}/command-cooldowns`),

  setCommandCooldown: (guildId: bigint, commandName: string, seconds: number) =>
    apiRequest<void>(`Administration/${guildId}/command-cooldowns/${commandName}`, "PUT", seconds),

  removeCommandCooldown: (guildId: bigint, commandName: string) =>
    apiRequest<void>(`Administration/${guildId}/command-cooldowns/${commandName}`, "DELETE"),

  getFilterSettings: (guildId: bigint) =>
    apiRequest<any>(`Filter/${guildId}/settings`),

  updateServerFilterSettings: (guildId: bigint, settings: { filterWords: boolean; filterInvites: boolean; filterLinks: boolean }) =>
    apiRequest<{ success: boolean }>(`Filter/${guildId}/server-settings`, "PUT", settings),

  toggleFilteredWord: (guildId: bigint, word: string) =>
    apiRequest<{ added: boolean; word: string }>(`Filter/${guildId}/words/${encodeURIComponent(word)}`, "POST"),

  getFilteredWords: (guildId: bigint) =>
    apiRequest<{ words: string[] }>(`Filter/${guildId}/words`),

  clearFilteredWords: (guildId: bigint) =>
    apiRequest<{ success: boolean; clearedCount: number }>(`Filter/${guildId}/words`, "DELETE"),

  toggleAutoBanWord: (guildId: bigint, word: string) =>
    apiRequest<{ added: boolean; word: string }>(`Filter/${guildId}/autoban-words/${encodeURIComponent(word)}`, "POST"),

  getAutoBanWords: (guildId: bigint) =>
    apiRequest<{ words: string[] }>(`Filter/${guildId}/autoban-words`),

  updateFilterWarnings: (guildId: bigint, settings: { warnOnFilteredWord?: boolean; warnOnInvite?: boolean }) =>
    apiRequest<{ success: boolean }>(`Filter/${guildId}/warnings`, "PUT", settings),

  toggleChannelFilter: (guildId: bigint, channelId: bigint, filterType: "word" | "invite" | "link") =>
    apiRequest<{ enabled: boolean; channelId: bigint }>(`Filter/${guildId}/channels/${channelId}/${filterType}-filter`, "POST"),

  updateTicketPanel: (guildId: bigint, panelId: number, data: any) =>
    apiRequest<void>(`Ticket/${guildId}/panels/${panelId}/embed`, "PUT", data),

  updatePanelButton: (guildId: bigint, buttonId: number, data: any) =>
    apiRequest<void>(`Ticket/${guildId}/buttons/${buttonId}`, "PUT", data),

  deletePanelButton: (guildId: bigint, buttonId: number) =>
    apiRequest<void>(`Ticket/${guildId}/buttons/${buttonId}`, "DELETE"),

  getDailyMessageStats: (guildId: bigint) =>
    apiRequest<{
      enabled: boolean;
      dailyMessages: number;
      totalMessages: number;
      lastUpdated: string;
    }>(`messagecount/${guildId}/daily`),

  getBirthdayConfig: (guildId: bigint) =>
    apiRequest<BirthdayConfig>(`birthday/${guildId}/config`),

  updateBirthdayConfig: (guildId: bigint, config: BirthdayConfigRequest) =>
    apiRequest<BirthdayConfig>(`birthday/${guildId}/config`, "PUT", config),

  resetBirthdayConfig: (guildId: bigint) =>
    apiRequest<BirthdayConfig>(`birthday/${guildId}/config/reset`, "POST"),

  getBirthdayUpcoming: (guildId: bigint, days: number = 7) =>
    apiRequest<BirthdayUser[]>(`birthday/${guildId}/upcoming?days=${days}`),

  getBirthdayToday: (guildId: bigint) =>
    apiRequest<BirthdayUser[]>(`birthday/${guildId}/today`),

  getBirthdayUsers: (guildId: bigint) =>
    apiRequest<BirthdayUser[]>(`birthday/${guildId}/users`),

  enableBirthdayFeature: (guildId: bigint, feature: BirthdayFeatures) =>
    apiRequest<{ success: boolean }>(`birthday/${guildId}/features/${feature}/enable`, "POST"),

  disableBirthdayFeature: (guildId: bigint, feature: BirthdayFeatures) =>
    apiRequest<{ success: boolean }>(`birthday/${guildId}/features/${feature}/disable`, "POST"),

  getBirthdayFeatures: (guildId: bigint) =>
    apiRequest<{ features: BirthdayFeatures }>(`birthday/${guildId}/features`),

  getBirthdayStats: (guildId: bigint) =>
    apiRequest<BirthdayStats>(`birthday/${guildId}/stats`),

  getTodoLists: (guildId: bigint, userId: bigint) =>
    apiRequest<TodoList[]>(`todo/${guildId}/lists/${userId}`),

  getTodoList: (guildId: bigint, listId: number, userId: bigint) =>
    apiRequest<TodoList>(`todo/${guildId}/lists/${listId}/${userId}`),

  createTodoList: (guildId: bigint, request: CreateTodoListRequest) =>
    apiRequest<TodoList>(`todo/${guildId}/lists`, "POST", request),

  deleteTodoList: (guildId: bigint, listId: number, userId: bigint) =>
    apiRequest<void>(`todo/${guildId}/lists/${listId}/${userId}`, "DELETE"),

  getTodoItems: (guildId: bigint, listId: number, userId: bigint, includeCompleted: boolean = false) =>
    apiRequest<TodoItem[]>(`todo/${guildId}/lists/${listId}/items/${userId}?includeCompleted=${includeCompleted}`),

  addTodoItem: (guildId: bigint, listId: number, request: AddTodoItemRequest) =>
    apiRequest<TodoItem>(`todo/${guildId}/lists/${listId}/items`, "POST", request),

  updateTodoItem: (guildId: bigint, itemId: number, request: UpdateTodoItemRequest) =>
    apiRequest<void>(`todo/${guildId}/items/${itemId}`, "PUT", request),

  completeTodoItem: (guildId: bigint, itemId: number, userId: bigint) =>
    apiRequest<void>(`todo/${guildId}/items/${itemId}/complete/${userId}`, "PUT"),

  deleteTodoItem: (guildId: bigint, itemId: number, userId: bigint) =>
    apiRequest<void>(`todo/${guildId}/items/${itemId}/${userId}`, "DELETE"),

  setTodoItemDueDate: (guildId: bigint, itemId: number, request: SetDueDateRequest) =>
    apiRequest<void>(`todo/${guildId}/items/${itemId}/duedate`, "PUT", request),

  addTodoItemTag: (guildId: bigint, itemId: number, request: TagRequest) =>
    apiRequest<void>(`todo/${guildId}/items/${itemId}/tags`, "POST", request),

  removeTodoItemTag: (guildId: bigint, itemId: number, request: TagRequest) =>
    apiRequest<void>(`todo/${guildId}/items/${itemId}/tags`, "DELETE", request),

  getTodoListPermissions: (guildId: bigint, listId: number, userId: bigint) =>
    apiRequest<TodoListPermission[]>(`todo/${guildId}/lists/${listId}/permissions/${userId}`),

  grantTodoListPermissions: (guildId: bigint, listId: number, request: GrantPermissionRequest) =>
    apiRequest<void>(`todo/${guildId}/lists/${listId}/permissions`, "POST", request),

  revokeTodoListPermissions: (guildId: bigint, listId: number, targetUserId: bigint, requestingUserId: bigint) =>
    apiRequest<void>(`todo/${guildId}/lists/${listId}/permissions/${targetUserId}/${requestingUserId}`, "DELETE"),

  getCustomVoiceConfig: (guildId: bigint) =>
    apiRequest<CustomVoiceConfigurationResponse>(`customvoice/${guildId}/configuration`),

  updateCustomVoiceConfig: (guildId: bigint, config: CustomVoiceConfigurationRequest) =>
    apiRequest<void>(`customvoice/${guildId}/configuration`, "PUT", config),

  getActiveCustomVoiceChannels: (guildId: bigint) =>
    apiRequest<CustomVoiceChannelResponse[]>(`customvoice/${guildId}/channels`),

  updateCustomVoiceChannel: (guildId: bigint, channelId: bigint, update: UpdateCustomVoiceChannelRequest) =>
    apiRequest<void>(`customvoice/${guildId}/channels/${channelId}`, "PUT", update),

  deleteCustomVoiceChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(`customvoice/${guildId}/channels/${channelId}`, "DELETE"),

  getCustomVoiceUserPreferences: (guildId: bigint, userId: bigint) =>
    apiRequest<CustomVoiceUserPreference>(`customvoice/${guildId}/user-preferences/${userId}`),

  updateCustomVoiceUserPreferences: (guildId: bigint, userId: bigint, preferences: Partial<CustomVoiceUserPreference>) =>
    apiRequest<void>(`customvoice/${guildId}/user-preferences/${userId}`, "PUT", preferences),

  // Logging endpoints
  getLoggingConfig: (guildId: bigint) =>
    apiRequest<LoggingConfigurationResponse>(`logging/${guildId}/configuration`),

  updateLoggingConfig: (guildId: bigint, config: Partial<LoggingConfigurationResponse>) =>
    apiRequest<void>(`logging/${guildId}/configuration`, "PUT", config),

  bulkUpdateLogChannels: (guildId: bigint, updates: BulkUpdateLogChannelsRequest) =>
    apiRequest<void>(`logging/${guildId}/channels/bulk`, "PUT", updates),

  setLogChannel: (guildId: bigint, logType: LogType, channelId: bigint | null) =>
    apiRequest<void>(`logging/${guildId}/channels/${logType}`, "POST", { channelId }),

  setIgnoredChannels: (guildId: bigint, request: SetIgnoredChannelsRequest) =>
    apiRequest<void>(`logging/${guildId}/ignored-channels`, "PUT", request),

  addIgnoredChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(`logging/${guildId}/ignored-channels`, "POST", { channelId }),

  removeIgnoredChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(`logging/${guildId}/ignored-channels/${channelId}`, "DELETE"),

  // Enhanced Filter endpoints
  getAutomodRules: (guildId: bigint) =>
    apiRequest<AutomodRule[]>(`filter/${guildId}/automod-rules`),

  createAutomodRule: (guildId: bigint, rule: CreateAutomodRuleRequest) =>
    apiRequest<AutomodRule>(`filter/${guildId}/automod-rules`, "POST", rule),

  updateAutomodRule: (guildId: bigint, ruleId: number, rule: Partial<CreateAutomodRuleRequest>) =>
    apiRequest<void>(`filter/${guildId}/automod-rules/${ruleId}`, "PUT", rule),

  deleteAutomodRule: (guildId: bigint, ruleId: number) =>
    apiRequest<void>(`filter/${guildId}/automod-rules/${ruleId}`, "DELETE"),

  toggleAutomodRule: (guildId: bigint, ruleId: number) =>
    apiRequest<boolean>(`filter/${guildId}/automod-rules/${ruleId}/toggle`, "POST"),

  getFilterStats: (guildId: bigint) =>
    apiRequest<FilterStats>(`filter/${guildId}/stats`),

  testAutomodRule: (guildId: bigint, ruleId: number, testMessage: string) =>
    apiRequest<{ triggered: boolean; reason?: string }>(`filter/${guildId}/automod-rules/${ruleId}/test`, "POST", { message: testMessage }),

  getMessageStats: (guildId: bigint) =>
    apiRequest<MessageStatsResponse>(`messagecount/${guildId}/stats`),

  getUserMessageStats: (guildId: bigint, userId: bigint) =>
    apiRequest<UserMessageStats>(`messagecount/${guildId}/user/${userId}`),

  getChannelMessageStats: (guildId: bigint, channelId: bigint) =>
    apiRequest<ChannelMessageStats>(`messagecount/${guildId}/channel/${channelId}`),

  getHourlyMessageStats: (guildId: bigint, days: number = 7) =>
    apiRequest<HourlyMessageStats[]>(`messagecount/${guildId}/hourly?days=${days}`),

  exportMessageStats: (guildId: bigint, request: MessageCountExportRequest) =>
    apiRequest<{ downloadUrl: string }>(`messagecount/${guildId}/export`, "POST", request),

  toggleMessageCount: (guildId: bigint) =>
    apiRequest<{ enabled: boolean; message: string }>(`messagecount/${guildId}/toggle`, "POST"),

  resetMessageCounts: (guildId: bigint, userId?: bigint, channelId?: bigint) => {
    let endpoint = `messagecount/${guildId}/reset`;
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId.toString());
    if (channelId) params.append('channelId', channelId.toString());
    if (params.toString()) endpoint += `?${params.toString()}`;
    return apiRequest<{ message: string }>(endpoint, "POST");
  },

  getSystemHealth: (userId: bigint) =>
    apiRequest<SystemHealthStatus>(`systeminfo/health?userId=${userId}`),

  getSystemMetrics: (userId: bigint, hours: number = 24) =>
    apiRequest<SystemMetrics[]>(`systeminfo/metrics?userId=${userId}&hours=${hours}`),

  getDatabaseMetrics: (userId: bigint) =>
    apiRequest<DatabaseMetrics>(`systeminfo/database?userId=${userId}`),

  getDetailedPerformanceData: (userId: bigint, moduleName?: string) =>
    apiRequest<PerformanceData[]>(`performance/detailed?userId=${userId}${moduleName ? `&module=${moduleName}` : ""}`),

  getInviteStats: (guildId: bigint) =>
    apiRequest<{
      totalInvites: number;
      activeInviters: number;
      todayJoins: number;
      weeklyJoins: number;
      topInviters: Array<{ userId: bigint; username: string; inviteCount: number; }>;
    }>(`InviteTracking/${guildId}/stats`),

  getInviteGraph: (guildId: bigint, days: number = 7) =>
    apiRequest<GraphStatsResponse>(`InviteTracking/${guildId}/graph?days=${days}`),

  getInviteAnalytics: (guildId: bigint) =>
    apiRequest<{
      conversionRate: number;
      averageInvitesPerUser: number;
      retentionRate: number;
      inviteSource: Array<{ source: string; count: number; }>;
    }>(`InviteTracking/${guildId}/analytics`),

  getStaffRole: (guildId: bigint) =>
    apiRequest<bigint>(`administration/${guildId}/staff-role`),

  setStaffRole: (guildId: bigint, roleId: bigint) =>
    apiRequest<void>(`administration/${guildId}/staff-role`, "POST", roleId),

  getMemberRole: (guildId: bigint) =>
    apiRequest<bigint>(`administration/${guildId}/member-role`),

  setMemberRole: (guildId: bigint, roleId: bigint) =>
    apiRequest<void>(`administration/${guildId}/member-role`, "POST", roleId),

  getDeleteMessageOnCommand: (guildId: bigint) =>
    apiRequest<{ enabled: boolean; channels: Array<{ channelId: bigint; state: boolean; }> }>(`administration/${guildId}/delete-message-on-command`),

  toggleDeleteMessageOnCommand: (guildId: bigint) =>
    apiRequest<boolean>(`administration/${guildId}/delete-message-on-command/toggle`, "POST"),

  setDeleteMessageOnCommandState: (guildId: bigint, channelId: bigint, state: "enable" | "disable" | "inherit") =>
    apiRequest<void>(`administration/${guildId}/delete-message-on-command/channel`, "POST", { channelId, state }),

  toggleStatsOptOut: (guildId: bigint) =>
    apiRequest<boolean>(`administration/${guildId}/stats-opt-out/toggle`, "POST"),

  deleteStatsData: (guildId: bigint) =>
    apiRequest<boolean>(`administration/${guildId}/stats-data`, "DELETE"),

  getAutoBanRoles: (guildId: bigint) =>
    apiRequest<Array<{ roleId: bigint; roleName: string; }>>(`administration/${guildId}/auto-ban-roles`),

  addAutoBanRole: (guildId: bigint, roleId: bigint) =>
    apiRequest<boolean>(`administration/${guildId}/auto-ban-roles`, "POST", roleId),

  removeAutoBanRole: (guildId: bigint, roleId: bigint) =>
    apiRequest<boolean>(`administration/${guildId}/auto-ban-roles/${roleId}`, "DELETE"),

  getVoiceChannelRoles: (guildId: bigint) =>
    apiRequest<Array<{ channelId: bigint; channelName: string; roleId: bigint; roleName: string; }>>(`administration/${guildId}/voice-channel-roles`),

  addVoiceChannelRole: (guildId: bigint, channelId: bigint, roleId: bigint) =>
    apiRequest<void>(`administration/${guildId}/voice-channel-roles`, "POST", { channelId, roleId }),

  removeVoiceChannelRole: (guildId: bigint, channelId: bigint) =>
    apiRequest<boolean>(`administration/${guildId}/voice-channel-roles/${channelId}`, "DELETE"),

  getSelfAssignableRoles: (guildId: bigint) =>
    apiRequest<{
      exclusive: boolean;
      roles: Array<{
        model: {
          id: number;
          guildId: bigint;
          roleId: bigint;
          group: number;
          levelRequirement: number;
        };
        role: {
          id: bigint;
          name: string;
          color: number;
        } | null;
      }>;
      groups: Record<number, string>;
    }>(`administration/${guildId}/self-assignable-roles`),

  addSelfAssignableRole: (guildId: bigint, roleId: bigint, group: number = 0) =>
    apiRequest<boolean>(`administration/${guildId}/self-assignable-roles`, "POST", { roleId, group }),

  removeSelfAssignableRole: (guildId: bigint, roleId: bigint) =>
    apiRequest<boolean>(`administration/${guildId}/self-assignable-roles/${roleId}`, "DELETE"),

  setSelfAssignableRoleGroup: (guildId: bigint, group: number, name: string | null) =>
    apiRequest<boolean>(`administration/${guildId}/self-assignable-roles/groups`, "POST", { group, name }),

  toggleSelfAssignableRolesExclusive: (guildId: bigint) =>
    apiRequest<boolean>(`administration/${guildId}/self-assignable-roles/exclusive/toggle`, "POST"),

  setSelfAssignableRoleLevelRequirement: (guildId: bigint, roleId: bigint, level: number) =>
    apiRequest<boolean>(`administration/${guildId}/self-assignable-roles/${roleId}/level`, "POST", level),

  toggleAutoDeleteSelfAssign: (guildId: bigint) =>
    apiRequest<boolean>(`administration/${guildId}/self-assignable-roles/auto-delete/toggle`, "POST"),

  // Reaction Roles
  getReactionRoles: (guildId: bigint) =>
    apiRequest<{
      success: boolean;
      reactionRoles: Array<{
        index: number;
        messageId: bigint;
        channelId: bigint;
        exclusive: boolean;
        reactionRoles: Array<{
          emoteName: string;
          roleId: bigint;
        }>;
      }>;
    }>(`administration/${guildId}/reaction-roles`),

  addReactionRoles: (guildId: bigint, messageId: bigint | null, exclusive: boolean, roles: Array<{ emoteName: string; roleId: bigint; }>) =>
    apiRequest<boolean>(`administration/${guildId}/reaction-roles`, "POST", { messageId, exclusive, roles }),

  removeReactionRole: (guildId: bigint, index: number) =>
    apiRequest<void>(`administration/${guildId}/reaction-roles/${index}`, "DELETE"),


  getAvailableTimezones: (guildId: bigint) =>
    apiRequest<Array<{ id: string; displayName: string; offset: string; }>>(`administration/${guildId}/timezones`),

  getGuildTimezone: (guildId: bigint) =>
    apiRequest<{ data: string } | string>(`administration/${guildId}/timezone`),

  setGuildTimezone: (guildId: bigint, timezoneId: string) =>
    apiRequest<void>(`administration/${guildId}/timezone`, "POST", { timezoneId }),

  // Permission Overrides
  getPermissionOverrides: (guildId: bigint) =>
    apiRequest<Array<{ command: string; permission: string; }>>(`administration/${guildId}/permission-overrides`),

  addPermissionOverride: (guildId: bigint, command: string, permission: string) =>
    apiRequest<void>(`administration/${guildId}/permission-overrides`, "POST", { command, permission }),

  removePermissionOverride: (guildId: bigint, command: string) =>
    apiRequest<void>(`administration/${guildId}/permission-overrides/${command}`, "DELETE"),

  clearAllPermissionOverrides: (guildId: bigint) =>
    apiRequest<void>(`administration/${guildId}/permission-overrides`, "DELETE"),

  // Game Voice Channels
  getGameVoiceChannel: (guildId: bigint) =>
    apiRequest<bigint | null>(`administration/${guildId}/game-voice-channel`),

  toggleGameVoiceChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<bigint | null>(`administration/${guildId}/game-voice-channel/toggle`, "POST", { channelId }),

  // Bot Ban Message Management
  setBanMessage: (guildId: bigint, message: string) =>
    apiRequest<void>(`administration/${guildId}/ban-message`, "POST", { message }),

  getBanMessage: (guildId: bigint) =>
    apiRequest<string>(`administration/${guildId}/ban-message`),

  massRename: (guildId: bigint, pattern: string) =>
    apiRequest<{ renamed: number; }>(`administration/${guildId}/mass-rename`, "POST", { pattern }),

  // Prune Operations
  pruneUsers: (guildId: bigint, days: number, reason?: string) =>
    apiRequest<{ pruned: number; }>(`administration/${guildId}/prune`, "POST", { days, reason }),

  pruneToMessage: (guildId: bigint, channelId: bigint, messageId: bigint) =>
    apiRequest<{ deleted: number; }>(`administration/${guildId}/prune-to`, "POST", { channelId, messageId }),

  // Counting endpoints
  getCountingChannels: (guildId: bigint) =>
    apiRequest<CountingChannelResponse[]>(`Counting/${guildId}/channels`),
  setupCountingChannel: (guildId: bigint, channelId: bigint, request: SetupCountingChannelRequest) =>
    apiRequest<CountingChannelResponse>(`Counting/${guildId}/channels/${channelId}/setup`, "POST", request),
  getCountingChannelStatus: (guildId: bigint, channelId: bigint) =>
    apiRequest<{ Channel: CountingChannelResponse; Statistics: any }>(`Counting/${guildId}/channels/${channelId}/status`),
  disableCountingChannel: (guildId: bigint, channelId: bigint, userId: bigint, reason?: string) =>
    apiRequest<string>(`Counting/${guildId}/channels/${channelId}?userId=${userId}${reason ? `&reason=${encodeURIComponent(reason)}` : ""}`, "DELETE"),
  
  getCountingChannelConfig: (guildId: bigint, channelId: bigint) =>
    apiRequest<CountingConfigResponse>(`Counting/${guildId}/channels/${channelId}/config`),
  updateCountingChannelConfig: (guildId: bigint, channelId: bigint, request: UpdateCountingConfigRequest) =>
    apiRequest<string>(`Counting/${guildId}/channels/${channelId}/config`, "PUT", request),
  
  getCountingChannelStats: (guildId: bigint, channelId: bigint) =>
    apiRequest<CountingStatsResponse>(`Counting/${guildId}/channels/${channelId}/stats`),
  getCountingChannelLeaderboard: (guildId: bigint, channelId: bigint, type: LeaderboardType = LeaderboardType.Contributions, limit: number = 20) =>
    apiRequest<LeaderboardResponse>(`Counting/${guildId}/channels/${channelId}/leaderboard?type=${type}&limit=${limit}`),
  getUserCountingStats: (guildId: bigint, channelId: bigint, userId: bigint) =>
    apiRequest<CountingUserStatsResponse>(`Counting/${guildId}/channels/${channelId}/users/${userId}/stats`),
  
  resetCountingChannel: (guildId: bigint, channelId: bigint, request: ResetCountingChannelRequest) =>
    apiRequest<string>(`Counting/${guildId}/channels/${channelId}/reset`, "POST", request),
  createCountingSavePoint: (guildId: bigint, channelId: bigint, request: CreateSavePointRequest) =>
    apiRequest<SavePointResponse>(`Counting/${guildId}/channels/${channelId}/saves`, "POST", request),
  restoreCountingSavePoint: (guildId: bigint, channelId: bigint, request: RestoreSavePointRequest) =>
    apiRequest<string>(`Counting/${guildId}/channels/${channelId}/restore`, "POST", request),
  
  banUserFromCounting: (guildId: bigint, channelId: bigint, userId: bigint, request: BanUserRequest) =>
    apiRequest<string>(`Counting/${guildId}/channels/${channelId}/users/${userId}/ban`, "POST", request),
  unbanUserFromCounting: (guildId: bigint, channelId: bigint, userId: bigint, request: UnbanUserRequest) =>
    apiRequest<string>(`Counting/${guildId}/channels/${channelId}/users/${userId}/ban`, "DELETE", request),
  getCountingViolationStats: (guildId: bigint, channelId: bigint, hours: number = 24) =>
    apiRequest<any>(`Counting/${guildId}/channels/${channelId}/violations?hours=${hours}`),
  getUserCountingWrongCount: (guildId: bigint, channelId: bigint, userId: bigint) =>
    apiRequest<{ UserId: bigint; WrongCount: number }>(`Counting/${guildId}/channels/${channelId}/users/${userId}/wrongcount`),
  clearUserCountingWrongCount: (guildId: bigint, channelId: bigint, userId: bigint, moderatorId: bigint) =>
    apiRequest<string>(`Counting/${guildId}/channels/${channelId}/users/${userId}/wrongcount?moderatorId=${moderatorId}`, "DELETE"),
  
  getCountingSavePoints: (guildId: bigint, channelId: bigint) =>
    apiRequest<SavePointResponse[]>(`Counting/${guildId}/channels/${channelId}/saves`),
  deleteCountingSavePoint: (guildId: bigint, channelId: bigint, saveId: number, userId: bigint) =>
    apiRequest<string>(`Counting/${guildId}/channels/${channelId}/saves/${saveId}?userId=${userId}`, "DELETE"),
  
  setCountingSuccessMessage: (guildId: bigint, channelId: bigint, request: SetCustomMessageRequest) =>
    apiRequest<string>(`Counting/${guildId}/channels/${channelId}/messages/success`, "PUT", request),
  setCountingFailureMessage: (guildId: bigint, channelId: bigint, request: SetCustomMessageRequest) =>
    apiRequest<string>(`Counting/${guildId}/channels/${channelId}/messages/failure`, "PUT", request),
  setCountingMilestoneMessage: (guildId: bigint, channelId: bigint, request: SetCustomMessageRequest) =>
    apiRequest<string>(`Counting/${guildId}/channels/${channelId}/messages/milestone`, "PUT", request),
  setCountingMilestones: (guildId: bigint, channelId: bigint, request: SetMilestonesRequest) =>
    apiRequest<string>(`Counting/${guildId}/channels/${channelId}/milestones`, "PUT", request),
  getCountingMilestones: (guildId: bigint, channelId: bigint) =>
    apiRequest<{ Milestones: number[] }>(`Counting/${guildId}/channels/${channelId}/milestones`),
  
  purgeCountingChannel: (guildId: bigint, channelId: bigint, request: PurgeChannelRequest) =>
    apiRequest<string>(`Counting/${guildId}/channels/${channelId}/purge`, "DELETE", request),

  // Repeater endpoints
  getRepeaters: (guildId: bigint) =>
    apiRequest<Array<{
      id: number;
      channelId: bigint;
      message: string;
      interval: string;
      startTimeOfDay: string | null;
      noRedundant: boolean;
      isEnabled: boolean;
      triggerMode: number;
      activityThreshold: number;
      activityTimeWindow: string;
      conversationDetection: boolean;
      conversationThreshold: number;
      priority: number;
      queuePosition: number;
      timeConditions: string | null;
      maxAge: number | null;
      maxTriggers: number | null;
      threadAutoSticky: boolean;
      threadOnlyMode: boolean;
      forumTagConditions: string | null;
      threadStickyMessages: string | null;
      displayCount: number;
      lastDisplayed: string | null;
      dateAdded: string;
      nextExecution: string | null;
      guildTimezone: string;
      requiresTimezone: boolean;
    }>>(`Repeaters/${guildId}`),

  getRepeater: (guildId: bigint, repeaterId: number) =>
    apiRequest<{
      id: number;
      channelId: bigint;
      message: string;
      interval: string;
      startTimeOfDay: string | null;
      noRedundant: boolean;
      isEnabled: boolean;
      triggerMode: number;
      activityThreshold: number;
      activityTimeWindow: string;
      conversationDetection: boolean;
      conversationThreshold: number;
      priority: number;
      queuePosition: number;
      timeConditions: string | null;
      maxAge: number | null;
      maxTriggers: number | null;
      threadAutoSticky: boolean;
      threadOnlyMode: boolean;
      forumTagConditions: string | null;
      threadStickyMessages: string | null;
      displayCount: number;
      lastDisplayed: string | null;
      dateAdded: string;
      nextExecution: string | null;
      guildTimezone: string;
      requiresTimezone: boolean;
    }>(`Repeaters/${guildId}/${repeaterId}`),

  createRepeater: (guildId: bigint, request: {
    channelId: bigint;
    interval: string;
    message: string;
    startTimeOfDay?: string;
    allowMentions?: boolean;
    triggerMode: number;
    activityThreshold: number;
    activityTimeWindow: string;
    conversationDetection: boolean;
    priority: number;
    timeSchedulePreset?: string;
    timeConditions?: string;
  }) =>
    apiRequest<{
      id: number;
      channelId: bigint;
      message: string;
      interval: string;
      startTimeOfDay: string | null;
      noRedundant: boolean;
      isEnabled: boolean;
      triggerMode: number;
      activityThreshold: number;
      activityTimeWindow: string;
      conversationDetection: boolean;
      conversationThreshold: number;
      priority: number;
      queuePosition: number;
      timeConditions: string | null;
      maxAge: number | null;
      maxTriggers: number | null;
      threadAutoSticky: boolean;
      threadOnlyMode: boolean;
      forumTagConditions: string | null;
      threadStickyMessages: string | null;
      displayCount: number;
      lastDisplayed: string | null;
      dateAdded: string;
      nextExecution: string | null;
      guildTimezone: string;
      requiresTimezone: boolean;
    }>(`Repeaters/${guildId}`, "POST", request),

  updateRepeater: (guildId: bigint, repeaterId: number, request: {
    message?: string;
    channelId?: bigint;
    interval?: string;
    triggerMode?: number;
    activityThreshold?: number;
    activityTimeWindow?: string;
    priority?: number;
    queuePosition?: number;
    conversationDetection?: boolean;
    conversationThreshold?: number;
    noRedundant?: boolean;
    isEnabled?: boolean;
    timeConditions?: string;
    maxAge?: string;
    maxTriggers?: number;
    threadAutoSticky?: boolean;
    threadOnlyMode?: boolean;
    forumTagConditions?: string;
    allowMentions?: boolean;
  }) =>
    apiRequest<{
      id: number;
      channelId: bigint;
      message: string;
      interval: string;
      startTimeOfDay: string | null;
      noRedundant: boolean;
      isEnabled: boolean;
      triggerMode: number;
      activityThreshold: number;
      activityTimeWindow: string;
      conversationDetection: boolean;
      conversationThreshold: number;
      priority: number;
      queuePosition: number;
      timeConditions: string | null;
      maxAge: number | null;
      maxTriggers: number | null;
      threadAutoSticky: boolean;
      threadOnlyMode: boolean;
      forumTagConditions: string | null;
      threadStickyMessages: string | null;
      displayCount: number;
      lastDisplayed: string | null;
      dateAdded: string;
      nextExecution: string | null;
      guildTimezone: string;
      requiresTimezone: boolean;
    }>(`Repeaters/${guildId}/${repeaterId}`, "PATCH", request),

  deleteRepeater: (guildId: bigint, repeaterId: number) =>
    apiRequest<{ success: boolean; message: string }>(`Repeaters/${guildId}/${repeaterId}`, "DELETE"),

  triggerRepeater: (guildId: bigint, repeaterId: number) =>
    apiRequest<{ success: boolean; message: string }>(`Repeaters/${guildId}/${repeaterId}/trigger`, "POST"),

  getRepeaterStatistics: (guildId: bigint) =>
    apiRequest<{
      totalRepeaters: number;
      activeRepeaters: number;
      disabledRepeaters: number;
      totalDisplays: number;
      timeScheduledRepeaters: number;
      conversationAwareRepeaters: number;
      triggerModeDistribution: Record<string, number>;
      mostActiveRepeater: {
        id: number;
        channelId: bigint;
        message: string;
        displayCount: number;
        triggerMode: number;
        priority: number;
      } | null;
    }>(`Repeaters/${guildId}/statistics`),

  bulkToggleRepeaters: (guildId: bigint, repeaterIds: number[], enable: boolean = true) =>
    apiRequest<{ results: Array<{ repeaterId: number; success: boolean; message?: string; error?: string; }> }>(`Repeaters/${guildId}/bulk-toggle?enable=${enable}`, "PATCH", repeaterIds),

  getMessageCountingStatus: (guildId: bigint) =>
    apiRequest<{ enabled: boolean; available: boolean; message?: string }>(`Repeaters/${guildId}/message-counting-status`),

  // Forum tag management endpoints
  updateRepeaterForumTags: (guildId: bigint, repeaterId: number, action: 'add' | 'remove' | 'clear' | 'list', tagType?: 'required' | 'excluded', tagIds?: bigint[]) => {
    const params = new URLSearchParams();
    if (tagType) params.set('tagType', tagType);
    if (action) params.set('action', action);
    
    const body = tagIds ? tagIds.map(id => id.toString()) : [];
    const url = `Repeaters/${guildId}/${repeaterId}/forum-tags?${params.toString()}`;
    
    return apiRequest<{ success: boolean; message?: string; conditions?: string }>
      (url, action === 'list' ? "GET" : "PATCH", action !== 'list' ? body : undefined);
  },

  // Individual update methods for specific properties
  updateRepeaterInterval: (guildId: bigint, repeaterId: number, interval: string) =>
    apiRequest<{ success: boolean; message: string }>(`Repeaters/${guildId}/${repeaterId}/interval`, "PATCH", { interval }),

  updateRepeaterQueuePosition: (guildId: bigint, repeaterId: number, queuePosition: number) =>
    apiRequest<{ success: boolean; message: string }>(`Repeaters/${guildId}/${repeaterId}/queue-position`, "PATCH", { queuePosition }),

  updateRepeaterStartTime: (guildId: bigint, repeaterId: number, startTimeOfDay: string | null) =>
    apiRequest<{ success: boolean; message: string }>(`Repeaters/${guildId}/${repeaterId}/start-time`, "PATCH", { startTimeOfDay }),

  updateRepeaterConversationThreshold: (guildId: bigint, repeaterId: number, conversationThreshold: number) =>
    apiRequest<{ success: boolean; message: string }>(`Repeaters/${guildId}/${repeaterId}/conversation-threshold`, "PATCH", { conversationThreshold }),

  updateRepeaterExpiry: (guildId: bigint, repeaterId: number, maxAge?: string | null, maxTriggers?: number | null) =>
    apiRequest<{ success: boolean; message: string }>(`Repeaters/${guildId}/${repeaterId}/expiry`, "PATCH", { maxAge, maxTriggers }),

  // Get thread sticky messages for a repeater
  getRepeaterThreadMessages: (guildId: bigint, repeaterId: number) =>
    apiRequest<Array<{ threadId: bigint; messageId: bigint; threadName: string; isActive: boolean }>>(`Repeaters/${guildId}/${repeaterId}/thread-messages`)
};
