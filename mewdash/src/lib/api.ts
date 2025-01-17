// lib/api.ts
import {
  type GuildConfig,
  type ChatTriggers,
  type SuggestionsModel,
  type BotStatusModel,
  type BotReviews,
  type MultiGreetType,
  type MultiGreet,
  type BotInstance,
  PrimaryPermissionType,
  SecondaryPermissionType,
  type PermissionCache, type Module
} from "$lib/types/models";
import JSONbig from "json-bigint";
import { logger } from "$lib/logger";
import type { Giveaways, PermissionOverride } from "$lib/types.ts";
import { currentInstance } from "$lib/stores/instanceStore.ts";
import { get } from "svelte/store";
import { PUBLIC_MEWDEKO_API_URL } from "$env/static/public";
import type { DiscordGuild } from "$lib/types/discordGuild.ts";

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
    logger.error(`API error: ${response.status} - ${errorText}`);
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

  getCommandsAndModules: () =>
  apiRequest<Module[]>('Permissions/commands'),

  getPermissions: (guildId: bigint) =>
    apiRequest<PermissionCache>(`Permissions/regular/${guildId}`),

  addPermission: (guildId: bigint, permission: {
    primaryTarget: PrimaryPermissionType,
    primaryTargetId: bigint,
    secondaryTarget: SecondaryPermissionType,
    secondaryTargetName: string,
    state: boolean,
    isCustomCommand?: boolean
  }) => apiRequest<void>(`Permissions/regular/${guildId}`, "POST", permission),

  removePermission: (guildId: bigint, index: number) =>
    apiRequest<void>(`Permissions/regular/${guildId}/${index}`, "DELETE"),

  movePermission: (guildId: bigint, from: number, to: number) =>
    apiRequest<void>(`Permissions/regular/${guildId}/move`, "POST", { from, to }),

  resetPermissions: (guildId: bigint) =>
    apiRequest<void>(`Permissions/regular/${guildId}/reset`, "POST"),

  setVerbose: (guildId: bigint, verbose: boolean) =>
    apiRequest<void>(`Permissions/regular/${guildId}/verbose`, "POST", verbose),

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
    apiRequest<void>(`guildconfig/${guildId}`, "POST", config),

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

  getBotStatus: () => apiRequest<BotStatusModel>("BotStatus"),

  getMutualGuilds: (userId: bigint, customFetch: typeof fetch = fetch) =>
    apiRequest<DiscordGuild[]>(`ClientOperations/mutualguilds/${userId}`, "GET", undefined, {}, customFetch),

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
    apiRequest<void>(`music/${guildId}/repeat/${mode}`, "POST")
};
