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
import JSONbig from "json-bigint";
import { logger } from "$lib/logger";
import type {
  Giveaways,
  PatreonAnalytics,
  PatreonConfig,
  PatreonConfigUpdateRequest,
  PatreonGoal,
  PatreonOAuthCallbackResponse,
  PatreonOAuthResponse,
  PatreonOAuthStatusResponse,
  PatreonOperationRequest,
  PatreonSupporter,
  PatreonTier,
  PatreonTierMappingRequest
} from "$lib/types.ts";
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
import { currentInstance } from "$lib/stores/instanceStore.ts";
import { get } from "svelte/store";
import { PUBLIC_MEWDEKO_API_URL } from "$env/static/public";
import type { DiscordGuild } from "$lib/types/discordGuild.ts";

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

  /*  getTicketPanels: (guildId: bigint) =>
      apiRequest<TicketPanel[]>(`ticket/${guildId}/panels`),

    createTicketPanel: (
      guildId: bigint,
      panel: {
        channelId: bigint;
        embedJson: string;
        title: string;
        description: string;
        color: {
          rawValue: number;
        };
      }
    ) =>
      apiRequest<void>(`ticket/${guildId}/panels`, "POST", panel),

    deleteTicketPanel: (guildId: bigint, panelId: number) =>
      apiRequest<void>(`ticket/${guildId}/panels/${panelId}`, "DELETE"),

    updateTicketPanelEmbed: (
      guildId: bigint,
      panelId: number,
      embed: {
        title: string;
        description: string;
        color: string;
      }
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

  // Button Management
    getPanelButtons: (guildId: bigint, panelId: number) =>
      apiRequest<TicketButton[]>(`ticket/${guildId}/panels/${panelId}/buttons`),

    addPanelButton: (
      guildId: bigint,
      panelId: number,
      button: {
        label: string;
        emoji: string;
        style: number;
        categoryId: bigint;
      }
    ) =>
      apiRequest<void>(`ticket/${guildId}/panels/${panelId}/buttons`, "POST", button),

    getButton: (guildId: bigint, buttonId: number) =>
      apiRequest<TicketButton>(`ticket/${guildId}/buttons/${buttonId}`),

    updateButton: (
      guildId: bigint,
      buttonId: number,
      button: {
        label: string;
        emoji: string;
        style: number;
        categoryId: bigint;
      }
    ) =>
      apiRequest<void>(`ticket/${guildId}/buttons/${buttonId}`, "PUT", button),

    deleteButton: (guildId: bigint, buttonId: number) =>
      apiRequest<void>(`ticket/${guildId}/buttons/${buttonId}`, "DELETE"),

  // Select Menu Management
    getPanelSelectMenus: (guildId: bigint, panelId: number) =>
      apiRequest<TicketSelectMenu[]>(`ticket/${guildId}/panels/${panelId}/selectmenus`),

    addPanelSelectMenu: (
      guildId: bigint,
      panelId: number,
      menu: {
        placeholder: string;
        minValues: number;
        maxValues: number;
      }
    ) =>
      apiRequest<void>(`ticket/${guildId}/panels/${panelId}/selectmenus`, "POST", menu),

    updateSelectMenuPlaceholder: (
      guildId: bigint,
      menuId: number,
      placeholder: string
    ) =>
      apiRequest<void>(`ticket/${guildId}/selectmenus/${menuId}/placeholder`, "PUT", placeholder),

    addSelectMenuOption: (
      guildId: bigint,
      menuId: number,
      option: {
        label: string;
        description: string;
        emoji: string;
        categoryId: bigint;
      }
    ) =>
      apiRequest<void>(`ticket/${guildId}/selectmenus/${menuId}/options`, "POST", option),

    deleteSelectMenu: (guildId: bigint, menuId: number) =>
      apiRequest<void>(`ticket/${guildId}/selectmenus/${menuId}`, "DELETE"),

  // Ticket Management
    getTicket: (guildId: bigint, ticketId: number) =>
      apiRequest<Ticket>(`ticket/${guildId}/tickets/${ticketId}`),

    getTicketByChannel: (guildId: bigint, channelId: bigint) =>
      apiRequest<Ticket>(`ticket/${guildId}/tickets/by-channel/${channelId}`),

    claimTicket: (guildId: bigint, channelId: bigint, staffId: bigint) =>
      apiRequest<void>(`ticket/${guildId}/tickets/by-channel/${channelId}/claim`, "POST", { staffId }),

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
      priorityId: number
    ) =>
      apiRequest<void>(`ticket/${guildId}/tickets/by-channel/${channelId}/priority`, "POST", { priorityId }),

    addTicketTags: (
      guildId: bigint,
      channelId: bigint,
      tagIds: number[]
    ) =>
      apiRequest<void>(`ticket/${guildId}/tickets/by-channel/${channelId}/tags`, "POST", { tagIds }),

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
      ticketCase: {
        title: string;
        description: string;
        priority: number;
      }
    ) =>
      apiRequest<void>(`ticket/${guildId}/cases`, "POST", ticketCase),

    updateTicketCase: (
      guildId: bigint,
      caseId: number,
      ticketCase: {
        title: string;
        description: string;
        priority: number;
      }
    ) =>
      apiRequest<void>(`ticket/${guildId}/cases/${caseId}`, "PUT", ticketCase),

    closeTicketCase: (guildId: bigint, caseId: number) =>
      apiRequest<void>(`ticket/${guildId}/cases/${caseId}/close`, "POST"),

    linkTicketsToCase: (
      guildId: bigint,
      caseId: number,
      ticketIds: number[]
    ) =>
      apiRequest<void>(`ticket/${guildId}/cases/${caseId}/link-tickets`, "POST", { ticketIds }),

  // Statistics
    getTicketStats: (guildId: bigint) =>
      apiRequest<TicketStats>(`ticket/${guildId}/statistics`),

    getUserTicketStats: (guildId: bigint, userId: bigint) =>
      apiRequest<UserTicketStats>(`ticket/${guildId}/statistics/users/${userId}`),

    getTicketActivity: (guildId: bigint, days?: number) =>
      apiRequest<TicketActivity>(`ticket/${guildId}/statistics/activity${days ? `?days=${days}` : ""}`),

    getStaffResponseStats: (guildId: bigint) =>
      apiRequest<StaffResponseStats>(`ticket/${guildId}/statistics/staff-response`),

  // Priority Management
    getTicketPriorities: (guildId: bigint) =>
      apiRequest<Priority[]>(`ticket/${guildId}/priorities`),

    createTicketPriority: (
      guildId: bigint,
      priority: {
        name: string;
        color: string;
        level: number;
      }
    ) =>
      apiRequest<void>(`ticket/${guildId}/priorities`, "POST", priority),

    deleteTicketPriority: (guildId: bigint, priorityId: number) =>
      apiRequest<void>(`ticket/${guildId}/priorities/${priorityId}`, "DELETE"),

  // Tag Management
    getTicketTags: (guildId: bigint) =>
      apiRequest<TicketTag[]>(`ticket/${guildId}/tags`),

    createTicketTag: (
      guildId: bigint,
      tag: {
        name: string;
        color: string;
      }
    ) =>
      apiRequest<void>(`ticket/${guildId}/tags`, "POST", tag),

    deleteTicketTag: (guildId: bigint, tagId: number) =>
      apiRequest<void>(`ticket/${guildId}/tags/${tagId}`, "DELETE"),

  // Blacklist Management
    getTicketBlacklist: (guildId: bigint) =>
      apiRequest<BlacklistedUser[]>(`ticket/${guildId}/blacklist`),

    blacklistUser: (
      guildId: bigint,
      userId: bigint,
      reason: string
    ) =>
      apiRequest<void>(`ticket/${guildId}/blacklist/${userId}`, "POST", { reason }),

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
      fromCategoryId: bigint,
      toCategoryId: bigint
    ) =>
      apiRequest<void>(`ticket/${guildId}/batch/move-tickets`, "POST", { fromCategoryId, toCategoryId }),

    addRoleBatch: (
      guildId: bigint,
      roleId: bigint,
      viewOnly: boolean
    ) =>
      apiRequest<void>(`ticket/${guildId}/batch/add-role`, "POST", { roleId, viewOnly }),

    transferTicketsBatch: (
      guildId: bigint,
      fromStaffId: bigint,
      toStaffId: bigint
    ) =>
      apiRequest<void>(`ticket/${guildId}/batch/transfer-tickets`, "POST", { fromStaffId, toStaffId }),

  // Settings
    setTicketTranscriptChannel: (guildId: bigint, channelId: bigint) =>
      apiRequest<void>(`ticket/${guildId}/settings/transcript-channel`, "PUT", { channelId }),

    setTicketLogChannel: (guildId: bigint, channelId: bigint) =>
      apiRequest<void>(`ticket/${guildId}/settings/log-channel`, "PUT", { channelId }),*/

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

    getPatreonGoals: (guildId: bigint) =>
      apiRequest<PatreonGoal[]>(`patreon/goals?guildId=${guildId}`),

    triggerPatreonOperation: (guildId: bigint, operation: PatreonOperationRequest) =>
      apiRequest<{ message: string }>(`patreon/operations?guildId=${guildId}`, "POST", operation),

    mapPatreonTierToRole: (guildId: bigint, mapping: PatreonTierMappingRequest) =>
      apiRequest<{ message: string }>(`patreon/tiers/map?guildId=${guildId}`, "POST", mapping),

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

  getSelfAssignableRoles: (guildId: bigint) =>
    apiRequest<Array<{
      id: number;
      guildId: bigint;
      roleId: bigint;
      group: number;
    }>>(`Administration/${guildId}/self-assignable-roles`),

  removeSelfAssignableRole: (guildId: bigint, roleId: bigint) =>
    apiRequest<{ success: boolean }>(`Administration/${guildId}/self-assignable-roles/${roleId}`, "DELETE"),

  // Message Count endpoints
  getDailyMessageStats: (guildId: bigint) =>
    apiRequest<{
      enabled: boolean;
      dailyMessages: number;
      totalMessages: number;
      lastUpdated: string;
    }>(`MessageCount/${guildId}/daily`),

  // Birthday System endpoints
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
    apiRequest<BirthdayStats>(`birthday/${guildId}/stats`)
};
