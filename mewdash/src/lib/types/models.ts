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

export interface ChatTriggers {
  id: number;
  useCount: string;
  isRegex: boolean;
  isValidRegex: boolean;
  ownerOnly: boolean;
  guildId: bigint | null;
  response: string;
  trigger: string;
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
  applicationCommandId: string;
  applicationCommandName: string | null;
  applicationCommandDescription: string | null;
  applicationType: CtApplicationCommandType;
  ephemeralResponse: boolean;
  crosspostingChannelId: string;
  crosspostingWebhookUrl: string | null;
}

export enum RequirePrefixType {
  None,
  Global,
  GuildOrGlobal,
  GuildOrNone,
  Custom,
}

export enum CtRoleGrantType {
  Sender,
  Mentioned,
  Both,
}

export enum ChatTriggerType {
  Message = 1,
  Interaction = 2,
  Button = 4,
}

export enum CtApplicationCommandType {
  None,
  Slash,
  Message,
  User,
}

export enum WarnExpireAction {
  Clear,
  Warn,
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
  suggestionId: bigint;
  suggestion?: string;
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

export interface MultiGreetDisplay
  extends Omit<MultiGreet, "guildId" | "channelId"> {
  guildId: string;
  channelId: string;
  channelName: string | null;
  channelMention: string | null;
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

export interface MusicSettings {
    maxVolume: number;
    defaultVolume: number;
    autoPlay: boolean;
    autoShuffle: boolean;
    announceNowPlaying: boolean;
    djEnabled: boolean;
    djOnlyMode: boolean;
    djRole: string;
    defaultRepeatMode: 'None' | 'Track' | 'Queue';
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

export interface PermissionOverride {
  id: number;
  guildId: bigint;
  command: string;
  discordPermission: bigint;
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

export interface PlayerStatus {
    currentTrack: QueueItem | null;
    queue: QueueItem[];
    state: 'Playing' | 'Paused' | 'Stopped';
    volume: number;
    position: {
        relativePosition: string;
    };
    filters: {
        bassBoost: boolean;
        nightcore: boolean;
        vaporwave: boolean;
        karaoke: boolean;
        tremolo: boolean;
        vibrato: boolean;
        rotation: boolean;
        distortion: boolean;
        channelMix: boolean;
    };
    isInVoiceChannel: boolean;
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

// Add interfaces for other types used in GuildConfig
export interface WarningPunishment2 {}
export interface AntiAltSetting {}
export interface LogSetting {}
export interface FollowedStream {}
export interface CommandCooldown {}
export interface FilterInvitesChannelIds {}
export interface FilterLinksChannelId {}
export interface FilteredWord {}
export interface FilterWordsChannelIds {}
export interface MutedUserId {}
export interface Repeater {}
export interface AntiRaidSetting {}
export interface AntiSpamSetting {}
export interface UnmuteTimer {}
export interface UnbanTimer {}
export interface UnroleTimer {}
export interface VcRoleInfo {}
export interface CommandAlias {}
export interface WarningPunishment {}
export interface NsfwBlacklitedTag {}
export interface StreamRoleSettings {}
export interface XpSettings {}
export interface FeedSub {}
export interface ReactionRoleMessage {}
export interface GroupName {}


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