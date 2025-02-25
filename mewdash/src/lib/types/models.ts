// lib/types/models.ts
import JSONbig from "json-bigint";

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
  Id: number;
  GuildId: bigint;
  Prefix: string;
  StaffRole: string;
  GameMasterRole: string;
  CommandLogChannel: string;
  DeleteMessageOnCommand: boolean;
  WarnMessage: string;
  AutoAssignRoleId: string;
  XpImgUrl: string;
  StatsOptOut: boolean;
  CurrencyName: string;
  CurrencyEmoji: string;
  RewardAmount: number;
  RewardTimeoutSeconds: number;
  GiveawayBanner: string;
  GiveawayEmbedColor: string;
  GiveawayWinEmbedColor: string;
  DmOnGiveawayWin: boolean;
  GiveawayEndMessage: string;
  GiveawayPingRole: string;
  StarboardAllowBots: boolean;
  StarboardRemoveOnDelete: boolean;
  StarboardRemoveOnReactionsClear: boolean;
  StarboardRemoveOnBelowThreshold: boolean;
  UseStarboardBlacklist: boolean;
  StarboardCheckChannels: string;
  VotesPassword: string;
  VotesChannel: string;
  VoteEmbed: string;
  SuggestionThreadType: number;
  ArchiveOnDeny: boolean;
  ArchiveOnAccept: boolean;
  ArchiveOnConsider: boolean;
  ArchiveOnImplement: boolean;
  SuggestButtonMessage: string;
  SuggestButtonName: string;
  SuggestButtonEmote: string;
  ButtonRepostThreshold: number;
  SuggestCommandsType: number;
  AcceptChannel: string;
  DenyChannel: string;
  ConsiderChannel: string;
  ImplementChannel: string;
  EmoteMode: number;
  SuggestMessage: string;
  DenyMessage: string;
  AcceptMessage: string;
  ImplementMessage: string;
  ConsiderMessage: string;
  MinSuggestLength: number;
  MaxSuggestLength: number;
  SuggestEmotes: string;
  sugnum: string;
  sugchan: string;
  SuggestButtonChannel: string;
  Emote1Style: number;
  Emote2Style: number;
  Emote3Style: number;
  Emote4Style: number;
  Emote5Style: number;
  SuggestButtonMessageId: string;
  SuggestButtonRepostThreshold: number;
  SuggestButtonColor: number;
  AfkMessage: string;
  AutoBotRoleIds: string;
  GBEnabled: number;
  GBAction: boolean;
  ConfessionLogChannel: string;
  ConfessionChannel: string;
  ConfessionBlacklist: string;
  MultiGreetType: number;
  MemberRole: string;
  TOpenMessage: string;
  GStartMessage: string;
  GEndMessage: string;
  GWinMessage: string;
  WarnlogChannelId: string;
  MiniWarnlogChannelId: string;
  SendBoostMessage: boolean;
  GRolesBlacklist: string;
  GUsersBlacklist: string;
  BoostMessage: string;
  BoostMessageChannelId: string;
  BoostMessageDeleteAfter: number;
  GiveawayEmote: string;
  TicketChannel: string;
  TicketCategory: string;
  snipeset: boolean;
  AfkLength: number;
  XpTxtTimeout: number;
  XpTxtRate: number;
  XpVoiceRate: number;
  XpVoiceTimeout: number;
  Stars: number;
  AfkType: number;
  AfkDisabledChannels: string;
  AfkDel: string;
  AfkTimeout: number;
  Joins: number;
  Leaves: number;
  Star2: string;
  StarboardChannel: string;
  RepostThreshold: number;
  PreviewLinks: number;
  ReactChannel: string;
  fwarn: number;
  invwarn: number;
  removeroles: number;
  AutoDeleteGreetMessages: boolean;
  AutoDeleteByeMessages: boolean;
  AutoDeleteGreetMessagesTimer: number;
  AutoDeleteByeMessagesTimer: number;
  GreetMessageChannelId: string;
  ByeMessageChannelId: string;
  GreetHook: string;
  LeaveHook: string;
  SendDmGreetMessage: boolean;
  DmGreetMessageText: string;
  SendChannelGreetMessage: boolean;
  ChannelGreetMessageText: string;
  SendChannelByeMessage: boolean;
  ChannelByeMessageText: string;
  ExclusiveSelfAssignedRoles: boolean;
  AutoDeleteSelfAssignedRoleMessages: boolean;
  LogSettingId: number | null;
  VerbosePermissions: boolean;
  PermissionRole: string | null;
  FilterInvites: boolean;
  FilterLinks: boolean;
  FilterWords: boolean;
  MuteRoleName: string | null;
  CleverbotChannel: string;
  VerboseErrors: boolean;
  NotifyStreamOffline: boolean;
  WarnExpireHours: number;
  WarnExpireAction: number;
  JoinGraphColor: number;
  LeaveGraphColor: number;
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

export function convertToGuildConfig(jsonResponse: string): GuildConfig {
  const parsed = JSONbig.parse(jsonResponse);

  return {
    Id: Number(parsed.Id),
    GuildId: BigInt(parsed.GuildId),
    Prefix: String(parsed.Prefix),
    StaffRole: String(parsed.StaffRole),
    GameMasterRole: String(parsed.GameMasterRole),
    CommandLogChannel: String(parsed.CommandLogChannel),
    DeleteMessageOnCommand: Boolean(parsed.DeleteMessageOnCommand),
    WarnMessage: String(parsed.WarnMessage),
    AutoAssignRoleId: String(parsed.AutoAssignRoleId),
    XpImgUrl: parsed.XpImgUrl || "",
    StatsOptOut: Boolean(parsed.StatsOptOut),
    CurrencyName: String(parsed.CurrencyName),
    CurrencyEmoji: String(parsed.CurrencyEmoji),
    RewardAmount: Number(parsed.RewardAmount),
    RewardTimeoutSeconds: Number(parsed.RewardTimeoutSeconds),
    GiveawayBanner: String(parsed.GiveawayBanner),
    GiveawayEmbedColor: String(parsed.GiveawayEmbedColor),
    GiveawayWinEmbedColor: String(parsed.GiveawayWinEmbedColor),
    DmOnGiveawayWin: Boolean(parsed.DmOnGiveawayWin),
    GiveawayEndMessage: String(parsed.GiveawayEndMessage),
    GiveawayPingRole: String(parsed.GiveawayPingRole),
    StarboardAllowBots: Boolean(parsed.StarboardAllowBots),
    StarboardRemoveOnDelete: Boolean(parsed.StarboardRemoveOnDelete),
    StarboardRemoveOnReactionsClear: Boolean(
      parsed.StarboardRemoveOnReactionsClear,
    ),
    StarboardRemoveOnBelowThreshold: Boolean(
      parsed.StarboardRemoveOnBelowThreshold,
    ),
    UseStarboardBlacklist: Boolean(parsed.UseStarboardBlacklist),
    StarboardCheckChannels: String(parsed.StarboardCheckChannels),
    VotesPassword: parsed.VotesPassword || "",
    VotesChannel: String(parsed.VotesChannel),
    VoteEmbed: parsed.VoteEmbed || "",
    SuggestionThreadType: Number(parsed.SuggestionThreadType),
    ArchiveOnDeny: Boolean(parsed.ArchiveOnDeny),
    ArchiveOnAccept: Boolean(parsed.ArchiveOnAccept),
    ArchiveOnConsider: Boolean(parsed.ArchiveOnConsider),
    ArchiveOnImplement: Boolean(parsed.ArchiveOnImplement),
    SuggestButtonMessage: String(parsed.SuggestButtonMessage),
    SuggestButtonName: String(parsed.SuggestButtonName),
    SuggestButtonEmote: String(parsed.SuggestButtonEmote),
    ButtonRepostThreshold: Number(parsed.ButtonRepostThreshold),
    SuggestCommandsType: Number(parsed.SuggestCommandsType),
    AcceptChannel: String(parsed.AcceptChannel),
    DenyChannel: String(parsed.DenyChannel),
    ConsiderChannel: String(parsed.ConsiderChannel),
    ImplementChannel: String(parsed.ImplementChannel),
    EmoteMode: Number(parsed.EmoteMode),
    SuggestMessage: String(parsed.SuggestMessage),
    DenyMessage: String(parsed.DenyMessage),
    AcceptMessage: String(parsed.AcceptMessage),
    ImplementMessage: String(parsed.ImplementMessage),
    ConsiderMessage: String(parsed.ConsiderMessage),
    MinSuggestLength: Number(parsed.MinSuggestLength),
    MaxSuggestLength: Number(parsed.MaxSuggestLength),
    SuggestEmotes: parsed.SuggestEmotes || "",
    sugnum: String(parsed.sugnum),
    sugchan: String(parsed.sugchan),
    SuggestButtonChannel: String(parsed.SuggestButtonChannel),
    Emote1Style: Number(parsed.Emote1Style),
    Emote2Style: Number(parsed.Emote2Style),
    Emote3Style: Number(parsed.Emote3Style),
    Emote4Style: Number(parsed.Emote4Style),
    Emote5Style: Number(parsed.Emote5Style),
    SuggestButtonMessageId: String(parsed.SuggestButtonMessageId),
    SuggestButtonRepostThreshold: Number(parsed.SuggestButtonRepostThreshold),
    SuggestButtonColor: Number(parsed.SuggestButtonColor),
    AfkMessage: String(parsed.AfkMessage),
    AutoBotRoleIds: parsed.AutoBotRoleIds || "",
    GBEnabled: Number(parsed.GBEnabled),
    GBAction: Boolean(parsed.GBAction),
    ConfessionLogChannel: String(parsed.ConfessionLogChannel),
    ConfessionChannel: String(parsed.ConfessionChannel),
    ConfessionBlacklist: String(parsed.ConfessionBlacklist),
    MultiGreetType: Number(parsed.MultiGreetType),
    MemberRole: String(parsed.MemberRole),
    TOpenMessage: String(parsed.TOpenMessage),
    GStartMessage: String(parsed.GStartMessage),
    GEndMessage: String(parsed.GEndMessage),
    GWinMessage: String(parsed.GWinMessage),
    WarnlogChannelId: String(parsed.WarnlogChannelId),
    MiniWarnlogChannelId: String(parsed.MiniWarnlogChannelId),
    SendBoostMessage: Boolean(parsed.SendBoostMessage),
    GRolesBlacklist: String(parsed.GRolesBlacklist),
    GUsersBlacklist: String(parsed.GUsersBlacklist),
    BoostMessage: String(parsed.BoostMessage),
    BoostMessageChannelId: String(parsed.BoostMessageChannelId),
    BoostMessageDeleteAfter: Number(parsed.BoostMessageDeleteAfter),
    GiveawayEmote: String(parsed.GiveawayEmote),
    TicketChannel: String(parsed.TicketChannel),
    TicketCategory: String(parsed.TicketCategory),
    snipeset: Boolean(parsed.snipeset),
    AfkLength: Number(parsed.AfkLength),
    XpTxtTimeout: Number(parsed.XpTxtTimeout),
    XpTxtRate: Number(parsed.XpTxtRate),
    XpVoiceRate: Number(parsed.XpVoiceRate),
    XpVoiceTimeout: Number(parsed.XpVoiceTimeout),
    Stars: Number(parsed.Stars),
    AfkType: Number(parsed.AfkType),
    AfkDisabledChannels: parsed.AfkDisabledChannels || "",
    AfkDel: parsed.AfkDel || "",
    AfkTimeout: Number(parsed.AfkTimeout),
    Joins: String(parsed.Joins),
    Leaves: String(parsed.Leaves),
    Star2: String(parsed.Star2),
    StarboardChannel: String(parsed.StarboardChannel),
    RepostThreshold: Number(parsed.RepostThreshold),
    PreviewLinks: Number(parsed.PreviewLinks),
    ReactChannel: String(parsed.ReactChannel),
    fwarn: Number(parsed.fwarn),
    invwarn: Number(parsed.invwarn),
    removeroles: Number(parsed.removeroles),
    AutoDeleteGreetMessages: Boolean(parsed.AutoDeleteGreetMessages),
    AutoDeleteByeMessages: Boolean(parsed.AutoDeleteByeMessages),
    AutoDeleteGreetMessagesTimer: Number(parsed.AutoDeleteGreetMessagesTimer),
    AutoDeleteByeMessagesTimer: Number(parsed.AutoDeleteByeMessagesTimer),
    GreetMessageChannelId: String(parsed.GreetMessageChannelId),
    ByeMessageChannelId: String(parsed.ByeMessageChannelId),
    GreetHook: String(parsed.GreetHook),
    LeaveHook: String(parsed.LeaveHook),
    SendDmGreetMessage: Boolean(parsed.SendDmGreetMessage),
    DmGreetMessageText: String(parsed.DmGreetMessageText),
    SendChannelGreetMessage: Boolean(parsed.SendChannelGreetMessage),
    ChannelGreetMessageText: String(parsed.ChannelGreetMessageText),
    SendChannelByeMessage: Boolean(parsed.SendChannelByeMessage),
    ChannelByeMessageText: String(parsed.ChannelByeMessageText),
    ExclusiveSelfAssignedRoles: Boolean(parsed.ExclusiveSelfAssignedRoles),
    AutoDeleteSelfAssignedRoleMessages: Boolean(
      parsed.AutoDeleteSelfAssignedRoleMessages,
    ),
    LogSettingId:
      parsed.LogSettingId !== null ? Number(parsed.LogSettingId) : null,
    VerbosePermissions: Boolean(parsed.VerbosePermissions),
    PermissionRole: parsed.PermissionRole,
    FilterInvites: Boolean(parsed.FilterInvites),
    FilterLinks: Boolean(parsed.FilterLinks),
    FilterWords: Boolean(parsed.FilterWords),
    MuteRoleName: parsed.MuteRoleName,
    CleverbotChannel: String(parsed.CleverbotChannel),
    VerboseErrors: Boolean(parsed.VerboseErrors),
    NotifyStreamOffline: Boolean(parsed.NotifyStreamOffline),
    WarnExpireHours: Number(parsed.WarnExpireHours),
    WarnExpireAction: Number(parsed.WarnExpireAction),
    JoinGraphColor: Number(parsed.JoinGraphColor),
    LeaveGraphColor: Number(parsed.LeaveGraphColor),
  };
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