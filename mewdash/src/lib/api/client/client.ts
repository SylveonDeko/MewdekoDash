// lib/api/client/client.ts
import { apiRequest } from "../core";
import type {
  ChannelType,
  ForumChannelInfo,
  GuildEmojiInfo,
  GuildMember,
  HasGuildResponse,
  MutualGuild,
  NeededRoleInfo,
  ThreadInfo,
  UserInfo
} from "./models";

/**
 * In-flight mutual guild requests, keyed by user, scope and instance. Four separate
 * components ask for this list on a cold load, which on mobile is four round trips
 * for one answer; concurrent callers share a single request instead.
 */
const mutualGuildRequests = new Map<string, Promise<MutualGuild[]>>();

/**
 * Client operations API for Discord-related data
 * Maps to Mewdeko.Controllers.ClientOperations
 */
export const clientApi = {
  /**
   * Gets all roles in a guild
   * @param guildId The guild ID
   * @returns List of roles with basic information
   */
  getRoles: (guildId: bigint) =>
    apiRequest<NeededRoleInfo[]>(`ClientOperations/roles/${guildId}`),

  /**
   * Gets all category channels in a guild
   * @param guildId The guild ID
   * @returns List of category channels
   */
  getCategories: (guildId: bigint) =>
    apiRequest<NeededRoleInfo[]>(`ClientOperations/categories/${guildId}`),

  /**
   * Gets channels of a specific type from a guild
   * @param guildId The guild ID
   * @param channelType The type of channels to retrieve (optional, defaults to all)
   * @returns List of channels matching the filter
   */
  getChannels: (guildId: bigint, channelType?: ChannelType) =>
    apiRequest<NeededRoleInfo[]>(
      `ClientOperations/channels/${guildId}/${channelType ?? 4}`,
    ),

  /**
   * Gets all text channels in a guild
   * @param guildId The guild ID
   * @returns List of text channels
   */
  getTextChannels: (guildId: bigint) =>
    apiRequest<Array<{ id: string; name: string }>>(
      `ClientOperations/textchannels/${guildId}`,
    ),

  /**
   * Gets all voice channels in a guild
   * @param guildId The guild ID
   * @returns List of voice channels
   */
  getVoiceChannels: (guildId: bigint) =>
    apiRequest<Array<{ id: string; name: string }>>(
      `ClientOperations/channels/${guildId}/1`,
    ),

  /**
   * Gets channels by specific channel type
   * @param guildId The guild ID
   * @param channelType The Discord channel type number
   * @returns List of channels
   */
  getChannelsByType: (guildId: bigint, channelType: number) =>
    apiRequest<Array<{ id: string; name: string }>>(
      `ClientOperations/channels/${guildId}/${channelType}`,
    ),

  /**
   * Gets all members in a guild
   * @param guildId The guild ID
   * @returns List of guild members
   */
  getMembers: (guildId: bigint) =>
    apiRequest<GuildMember[]>(`ClientOperations/members/${guildId}`),

  /**
   * Gets all users in a guild (serialized)
   * @param guildId The guild ID
   * @returns JSON string of users
   */
  getUsers: (guildId: bigint) =>
    apiRequest<string>(`ClientOperations/users/${guildId}`),

  /**
   * Gets a specific user from a guild
   * @param guildId The guild ID
   * @param userId The user ID
   * @returns User information
   */
  getUser: (guildId: bigint, userId: bigint) =>
    apiRequest<UserInfo>(`ClientOperations/user/${guildId}/${userId}`),

  /**
   * Gets mutual guilds between the bot and a user
   * @param userId The user ID
   * @param adminOnly Whether to only return guilds where the user has admin permissions
   * @param customFetch Custom fetch function (for SSR)
   * @param additionalHeaders Additional headers to include
   * @returns List of mutual guilds, empty when none are found
   */
  getMutualGuilds: (
    userId: bigint,
    adminOnly: boolean = true,
    customFetch: typeof fetch = fetch,
    additionalHeaders: HeadersInit = {},
  ) => {
    const port = (additionalHeaders as Record<string, string>)["X-Instance-Port"] ?? "default";
    const key = `${userId}:${adminOnly}:${port}`;

    const running = mutualGuildRequests.get(key);
    if (running) return running;

    const request = apiRequest<MutualGuild[]>(
      `ClientOperations/mutualguilds/${userId}?adminOnly=${adminOnly}`,
      "GET",
      undefined,
      additionalHeaders,
      customFetch,
    ).finally(() => {
      mutualGuildRequests.delete(key);
    });

    mutualGuildRequests.set(key, request);
    return request;
  },

  /**
   * Checks if the bot has a specific guild
   * @param guildId The guild ID
   * @returns Guild information if found
   */
  hasGuild: (guildId: bigint) =>
    apiRequest<HasGuildResponse>(`ClientOperations/hasguild/${guildId}`),

  /**
   * Gets all guilds the bot is in
   * @returns JSON string of guild IDs
   */
  getGuilds: () => apiRequest<string>(`ClientOperations/guilds`),

  /**
   * Gets all forum channels in a guild with detailed information
   * @param guildId The guild ID
   * @returns List of forum channels with tags and threads
   */
  getForumChannels: (guildId: bigint) =>
    apiRequest<ForumChannelInfo[]>(`ClientOperations/forumchannels/${guildId}`),

  /**
   * Gets detailed information about a specific forum channel
   * @param guildId The guild ID
   * @param forumId The forum channel ID
   * @returns Detailed forum channel information
   */
  getForumChannel: (guildId: bigint, forumId: bigint) =>
    apiRequest<ForumChannelInfo>(
      `ClientOperations/forumchannel/${guildId}/${forumId}`,
    ),

  /**
   * Gets threads for a specific forum channel
   * @param guildId The guild ID
   * @param forumId The forum channel ID
   * @param includeArchived Whether to include archived threads
   * @returns List of threads
   */
  getForumThreads: (
    guildId: bigint,
    forumId: bigint,
    includeArchived: boolean = false,
  ) =>
    apiRequest<ThreadInfo[]>(
      `ClientOperations/forumthreads/${guildId}/${forumId}?includeArchived=${includeArchived}`,
    ),

  /**
   * Gets emojis from mutual guilds for the emoji picker
   * @param userId The user ID
   * @param adminOnly Whether to only include guilds where user has admin permissions
   * @returns List of guild emojis grouped by guild
   */
  getEmojis: (userId: bigint, adminOnly: boolean = true) =>
    apiRequest<GuildEmojiInfo[]>(
      `ClientOperations/emojis/${userId}?adminOnly=${adminOnly}`,
    ),
};
