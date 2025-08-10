// lib/types/models.ts

export interface BotReviews {
  id: number;
  userId: bigint;
  username: string;
  avatarUrl: string;
  stars: number;
  review: string;
  dateAdded: string;
}

export interface GuildConfig {
  id: number;
  guildId: bigint;
  prefix: string | null;
  staffRole: bigint;
  gameMasterRole: bigint;
  commandLogChannel: bigint;
  deleteMessageOnCommand: boolean;
  warnMessage: string | null;
  autoAssignRoleId: string | null;
  xpImgUrl: string | null;
  statsOptOut: boolean;
  currencyName: string | null;
  currencyEmoji: string | null;
  rewardAmount: number;
  rewardTimeoutSeconds: number;
  giveawayBanner: string | null;
  giveawayEmbedColor: string | null;
  giveawayWinEmbedColor: string | null;
  dmOnGiveawayWin: boolean;
  giveawayEndMessage: string | null;
  giveawayPingRole: bigint;
  starboardAllowBots: boolean;
  starboardRemoveOnDelete: boolean;
  starboardRemoveOnReactionsClear: boolean;
  starboardRemoveOnBelowThreshold: boolean;
  useStarboardBlacklist: boolean;
  starboardCheckChannels: string | null;
  votesPassword: string | null;
  votesChannel: bigint;
  voteEmbed: string | null;
  suggestionThreadType: number;
  archiveOnDeny: boolean;
  archiveOnAccept: boolean;
  archiveOnConsider: boolean;
  archiveOnImplement: boolean;
  suggestButtonMessage: string | null;
  suggestButtonName: string | null;
  suggestButtonEmote: string | null;
  buttonRepostThreshold: number;
  suggestCommandsType: number;
  acceptChannel: bigint;
  denyChannel: bigint;
  considerChannel: bigint;
  implementChannel: bigint;
  emoteMode: number;
  suggestMessage: string | null;
  denyMessage: string | null;
  acceptMessage: string | null;
  implementMessage: string | null;
  considerMessage: string | null;
  minSuggestLength: number;
  maxSuggestLength: number;
  suggestEmotes: string | null;
  sugnum: bigint;
  sugchan: bigint;
  suggestButtonChannel: bigint;
  emote1Style: number;
  emote2Style: number;
  emote3Style: number;
  emote4Style: number;
  emote5Style: number;
  suggestButtonMessageId: bigint;
  suggestButtonRepostThreshold: number;
  suggestButtonColor: number;
  afkMessage: string | null;
  autoBotRoleIds: string | null;
  gbEnabled: number;
  gbAction: boolean;
  confessionLogChannel: bigint;
  confessionChannel: bigint;
  confessionBlacklist: string | null;
  multiGreetType: number;
  memberRole: bigint;
  tOpenMessage: string | null;
  gStartMessage: string | null;
  gEndMessage: string | null;
  gWinMessage: string | null;
  warnlogChannelId: bigint;
  miniWarnlogChannelId: bigint;
  sendBoostMessage: boolean;
  gRolesBlacklist: string | null;
  gUsersBlacklist: string | null;
  boostMessage: string | null;
  boostMessageChannelId: bigint;
  boostMessageDeleteAfter: number;
  giveawayEmote: string | null;
  ticketChannel: bigint;
  ticketCategory: bigint;
  snipeset: boolean;
  afkLength: number;
  xpTxtTimeout: number;
  xpTxtRate: number;
  xpVoiceRate: number;
  xpVoiceTimeout: number;
  stars: number;
  afkType: number;
  afkDisabledChannels: string | null;
  afkDel: string | null;
  afkTimeout: number;
  joins: bigint;
  leaves: bigint;
  star2: string | null;
  starboardChannel: bigint;
  repostThreshold: number;
  previewLinks: number;
  reactChannel: bigint;
  fwarn: number;
  invwarn: number;
  removeroles: number;
  autoDeleteByeMessages: boolean;
  autoDeleteByeMessagesTimer: number;
  byeMessageChannelId: bigint;
  leaveHook: string | null;
  sendDmGreetMessage: boolean;
  dmGreetMessageText: string | null;
  sendChannelByeMessage: boolean;
  channelByeMessageText: string | null;
  exclusiveSelfAssignedRoles: boolean;
  autoDeleteSelfAssignedRoleMessages: boolean;
  logSettingId: number | null;
  verbosePermissions: boolean;
  permissionRole: string | null;
  filterInvites: boolean;
  filterLinks: boolean;
  filterWords: boolean;
  muteRoleName: string | null;
  cleverbotChannel: bigint;
  locale: string | null;
  timeZoneId: string | null;
  warningsInitialized: boolean;
  gameVoiceChannel: bigint | null;
  verboseErrors: boolean;
  notifyStreamOffline: boolean;
  warnExpireHours: number;
  warnExpireAction: number;
  joinGraphColor: bigint;
  leaveGraphColor: bigint;
  dateAdded: Date | null;
  useMessageCount: boolean;
  minMessageLength: number;
}

export interface Starboard {
  id: number;
  guildId: bigint;
  starboardChannelId: bigint;
  emote: string;
  threshold: number;
  checkedChannels: string;
  useBlacklist: boolean;
  allowBots: boolean;
  removeOnDelete: boolean;
  removeOnReactionsClear: boolean;
  removeBelowThreshold: boolean;
  repostThreshold: number;
}

export interface ChatTriggers {
  id: number;
  useCount: bigint;
  isRegex: boolean;
  isValidRegex?: boolean; // Frontend only property
  ownerOnly: boolean;
  guildId: bigint | null;
  response: string | null;
  trigger: string | null;
  prefixType: RequirePrefixType;
  customPrefix: string | null;
  autoDeleteTrigger: boolean;
  reactToTrigger: boolean;
  noRespond: boolean;
  dmResponse: boolean;
  containsAnywhere: boolean;
  allowTarget: boolean;
  reactions: string | null;
  grantedRoles: string | null;
  removedRoles: string | null;
  roleGrantType: CtRoleGrantType;
  validTriggerTypes: ChatTriggerType;
  applicationCommandId: bigint;
  applicationCommandName: string | null;
  applicationCommandDescription: string | null;
  applicationCommandType: CtApplicationCommandType;
  ephemeralResponse: boolean;
  crosspostingChannelId: bigint;
  crosspostingWebhookUrl: string | null;
  dateAdded?: Date | null;
}

export enum RequirePrefixType {
  None = 0,
  Global = 1,
  GuildOrGlobal = 2,
  GuildOrNone = 3,
  Custom = 4,
}

export enum CtRoleGrantType {
  Sender = 0,
  Mentioned = 1,
  Both = 2,
}

export enum ChatTriggerType {
  Message = 1,      // 0b0001
  Interaction = 2,  // 0b0010
  Button = 4,       // 0b0100
  Reactions = 8,    // 0b1000
}

export enum CtApplicationCommandType {
  None = 0,
  Slash = 1,
  Message = 2,
  User = 3,
}

export interface Afk {
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
}

export enum SuggestionState {
  Pending = 0,
  Accepted = 1,
  Denied = 2,
  Considered = 3,
  Implemented = 4,
}

export interface BotStatusModel {
  botName: string;
  botAvatar: string;
  botBanner: string | null;
  botLatency: number;
  botVersion: string;
  commandsCount: number;
  modulesCount: number;
  dNetVersion: string;
  botStatus: string;
  userCount: number;
  commitHash: string;
  botId: bigint;
}

export interface SuggestionsModel {
  id: number;
  guildId: bigint;
  suggestionId: number;
  suggestion1?: string;
  messageId: bigint;
  userId: bigint;
  emoteCount1: number;
  emoteCount2: number;
  emoteCount3: number;
  emoteCount4: number;
  emoteCount5: number;
  stateChangeUser: bigint;
  stateChangeCount: bigint;
  stateChangeMessageId: bigint;
  currentState: SuggestionState;
}

export interface MultiGreet {
  id: number;
  guildId: bigint;
  channelId: bigint;
  message: string | null;
  deleteTime: number;
  webhookUrl: string | null;
  greetBots: boolean;
  disabled: boolean;
}

export enum MultiGreetType {
  MultiGreet = 0,
  RandomGreet = 1,
  Off = 2,
}

/**
 * Represents a module containing commands
 */
export interface Module {
  /**
   * List of commands in the module
   */
  commands: Command[];

  /**
   * The name of the module
   */
  name: string;
}

/**
 * Represents a command's information
 */
export interface Command {
  /**
   * The bot version the specified command exists on
   */
  botVersion: string;

  /**
   * Whether the command is a dragon command (beta only)
   */
  isDragon: boolean;

  /**
   * The name of the command
   */
  commandName: string;

  /**
   * The description of the command
   */
  description: string;

  /**
   * Examples of how to use the command
   */
  example: string[];

  /**
   * The guild permissions required by the user to use the command
   */
  guildUserPermissions?: string;

  /**
   * The channel permissions required by the user to use the command
   */
  channelUserPermissions?: string;

  /**
   * The channel permissions required by the bot to use the command
   */
  channelBotPermissions?: string;

  /**
   * The guild permissions required by the bot to use the command
   */
  guildBotPermissions?: string;
}

export interface BotInstance {
    port: number;
    botId: bigint;
    botName: string;
    botAvatar: string;
    isActive: boolean;
}

export enum PrimaryPermissionType {
  User = 0,
  Channel = 1,
  Role = 2,
  Server = 3,
  Category = 4
}

export enum SecondaryPermissionType {
  Module = 0,
  Command = 1,
  AllModules = 2
}

export interface Permission {
  index: number;
  primaryTarget: PrimaryPermissionType;
  primaryTargetId: bigint;
  secondaryTarget: SecondaryPermissionType;
  secondaryTargetName: string;
  state: boolean;
  isCustomCommand?: boolean;
}

export interface PermissionCache {
  permissions: Permission[];
  verbose: boolean;
  permRole: bigint | null;
}

export interface CommandInfo {
  name: string;
  module: string;
  description: string;
  isCustom?: boolean;
}

export interface Track {
    title: string;
    author: string;
    duration: string;
    uri: string;
    artworkUri?: string;
}

export interface QueueItem {
    index: number;
    track: Track;
    requester: {
        id: string;
        username: string;
        avatarUrl: string;
    };
}

export interface Permissionv2 {
  guildConfigId?: number;
  primaryTarget: PrimaryPermissionType;
  primaryTargetId: bigint;
  secondaryTarget: SecondaryPermissionType;
  secondaryTargetName: string | null;
  isCustomCommand: boolean;
  state: boolean;
  index: number;
}


export interface GraphStatsResponse {
  dailyStats: DailyStatDto[];
  summary: GraphSummaryDto;
}

export interface DailyStatDto {
  date: string;
  count: number;
}

export interface GraphSummaryDto {
  average: string | number;
  peakCount: number;
  peakDate: string;
  total: number;
}