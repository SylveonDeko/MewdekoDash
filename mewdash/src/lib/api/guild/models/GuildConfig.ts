// lib/api/guild/models/GuildConfig.ts

/**
 * Complete guild configuration model
 * Maps to DataModel.GuildConfig from Database/L2DB/GuildConfig.cs
 * This is a massive model containing all guild settings
 */
export interface GuildConfig {
  /** Primary key */
  id: number;

  /** The guild ID */
  guildId: bigint;

  /** Custom command prefix */
  prefix: string | null;

  /** Staff role ID */
  staffRole: bigint;

  /** Command log channel ID */
  commandLogChannel: bigint;

  /** Whether to delete messages after commands */
  deleteMessageOnCommand: boolean;

  /** Auto-assign role IDs (comma-separated) */
  autoAssignRoleId: string | null;

  /** Whether guild opted out of stats */
  statsOptOut: boolean;

  /** Custom currency emoji */
  currencyEmoji: string | null;

  /** Currency reward amount */
  rewardAmount: number;

  /** Currency reward timeout in seconds */
  rewardTimeoutSeconds: number;

  // Giveaway Settings
  /** Giveaway banner URL */
  giveawayBanner: string | null;

  /** Giveaway embed color */
  giveawayEmbedColor: string | null;

  /** DM users on giveaway win */
  dmOnGiveawayWin: boolean;

  /** Giveaway end message */
  giveawayEndMessage: string | null;

  /** Role to ping for giveaways */
  giveawayPingRole: bigint;

  /** Giveaway emote */
  giveawayEmote: string | null;

  /** Giveaway start message */
  gStartMessage: string | null;

  /** Giveaway end message */
  gEndMessage: string | null;

  /** Giveaway win message */
  gWinMessage: string | null;

  /** Giveaway roles blacklist */
  gRolesBlacklist: string | null;

  /** Giveaway users blacklist */
  gUsersBlacklist: string | null;

  // Voting Settings
  /** Votes password */
  votesPassword: string | null;

  /** Votes channel ID */
  votesChannel: bigint;

  /** Vote embed configuration */
  voteEmbed: string | null;

  // Suggestion Settings
  /** Suggestion thread type */
  suggestionThreadType: number;

  /** Archive on deny */
  archiveOnDeny: boolean;

  /** Archive on accept */
  archiveOnAccept: boolean;

  /** Archive on consider */
  archiveOnConsider: boolean;

  /** Archive on implement */
  archiveOnImplement: boolean;

  /** Suggest button message */
  suggestButtonMessage: string | null;

  /** Suggest button name */
  suggestButtonName: string | null;

  /** Suggest button emote */
  suggestButtonEmote: string | null;

  /** Button repost threshold */
  buttonRepostThreshold: number;

  /** Suggest commands type */
  suggestCommandsType: number;

  /** Accept channel ID */
  acceptChannel: bigint;

  /** Deny channel ID */
  denyChannel: bigint;

  /** Consider channel ID */
  considerChannel: bigint;

  /** Implement channel ID */
  implementChannel: bigint;

  /** Emote mode */
  emoteMode: number;

  /** Suggest message */
  suggestMessage: string | null;

  /** Deny message */
  denyMessage: string | null;

  /** Accept message */
  acceptMessage: string | null;

  /** Implement message */
  implementMessage: string | null;

  /** Consider message */
  considerMessage: string | null;

  /** Minimum suggestion length */
  minSuggestLength: number;

  /** Maximum suggestion length */
  maxSuggestLength: number;

  /** Suggestion emotes */
  suggestEmotes: string | null;

  /** Suggestion number */
  sugnum: bigint;

  /** Suggestion channel */
  sugchan: bigint;

  /** Suggest button channel */
  suggestButtonChannel: bigint;

  /** Emote 1 style */
  emote1Style: number;

  /** Emote 2 style */
  emote2Style: number;

  /** Emote 3 style */
  emote3Style: number;

  /** Emote 4 style */
  emote4Style: number;

  /** Emote 5 style */
  emote5Style: number;

  /** Suggest button message ID */
  suggestButtonMessageId: bigint;

  /** Suggest button repost threshold */
  suggestButtonRepostThreshold: number;

  /** Suggest button color */
  suggestButtonColor: number;

  // AFK Settings
  /** AFK message */
  afkMessage: string | null;

  /** AFK length */
  afkLength: number;

  /** AFK type */
  afkType: number;

  /** AFK disabled channels */
  afkDisabledChannels: string | null;

  /** AFK deletion setting */
  afkDel: string | null;

  /** AFK timeout */
  afkTimeout: number;

  // Stream Settings
  /** Stream message */
  streamMessage: string | null;

  /** Notify when stream goes offline */
  notifyStreamOffline: boolean;

  // Bot Role Settings
  /** Auto bot role IDs */
  autoBotRoleIds: string | null;

  /** GB enabled */
  gbEnabled: number;

  /** GB action */
  gbAction: boolean;

  // Confession Settings
  /** Confession log channel */
  confessionLogChannel: bigint;

  /** Confession channel */
  confessionChannel: bigint;

  /** Confession blacklist */
  confessionBlacklist: string | null;

  // Multi-Greet Settings
  /** Multi-greet type */
  multiGreetType: number;

  // Member Settings
  /** Member role */
  memberRole: bigint;

  // Ticket Settings
  /** Ticket open message */
  tOpenMessage: string | null;

  /** Ticket channel */
  ticketChannel: bigint;

  /** Ticket category */
  ticketCategory: bigint;

  // Warning Settings
  /** Warn log channel ID */
  warnlogChannelId: bigint;

  /** Mini warn log channel ID */
  miniWarnlogChannelId: bigint;

  /** Warning expire hours */
  warnExpireHours: number;

  /** Warning expire action */
  warnExpireAction: number;

  // Boost Settings
  /** Send boost message */
  sendBoostMessage: boolean;

  /** Boost message */
  boostMessage: string | null;

  /** Boost message channel ID */
  boostMessageChannelId: bigint;

  /** Boost message delete after seconds */
  boostMessageDeleteAfter: number;

  // Misc Settings
  /** Snipe set */
  snipeset: boolean;

  /** Preview links */
  previewLinks: number;

  /** Filter warn */
  fwarn: number;

  /** Invite warn */
  invwarn: number;

  /** Remove roles */
  removeroles: number;

  // Bye Message Settings
  /** Auto delete bye messages timer */
  autoDeleteByeMessagesTimer: number;

  /** Bye message channel ID */
  byeMessageChannelId: bigint;

  /** Leave hook */
  leaveHook: string | null;

  /** Send DM greet message */
  sendDmGreetMessage: boolean;

  /** DM greet message text */
  dmGreetMessageText: string | null;

  /** Send channel bye message */
  sendChannelByeMessage: boolean;

  /** Channel bye message text */
  channelByeMessageText: string | null;

  // Self-Assigned Roles
  /** Exclusive self-assigned roles */
  exclusiveSelfAssignedRoles: boolean;

  /** Auto-delete self-assigned role messages */
  autoDeleteSelfAssignedRoleMessages: boolean;

  // Permission Settings
  /** Verbose permissions */
  verbosePermissions: boolean;

  /** Permission role */
  permissionRole: string | null;

  // Filter Settings
  /** Filter invites */
  filterInvites: boolean;

  /** Filter links */
  filterLinks: boolean;

  /** Filter words */
  filterWords: boolean;

  /** Mute role name */
  muteRoleName: string | null;

  // Localization
  /** Guild locale */
  locale: string | null;

  /** Time zone ID */
  timeZoneId: string | null;

  // Game Settings
  /** Game voice channel */
  gameVoiceChannel: bigint | null;

  /** Verbose errors */
  verboseErrors: boolean;

  // Graph Colors
  /** Join graph color */
  joinGraphColor: number;

  /** Leave graph color */
  leaveGraphColor: number;

  /** Date added */
  dateAdded: string | null;

  // Message Count
  /** Use message count */
  useMessageCount: boolean;

  /** Minimum message length */
  minMessageLength: number;

  // Patreon Settings
  /** Patreon channel ID */
  patreonChannelId: bigint;

  /** Patreon message */
  patreonMessage: string | null;

  /** Patreon announcement day */
  patreonAnnouncementDay: number;

  /** Patreon enabled */
  patreonEnabled: boolean;

  /** Patreon last announcement */
  patreonLastAnnouncement: string | null;

  /** Patreon campaign ID */
  patreonCampaignId: string | null;

  /** Patreon access token */
  patreonAccessToken: string | null;

  /** Patreon refresh token */
  patreonRefreshToken: string | null;

  /** Patreon token expiry */
  patreonTokenExpiry: string | null;

  /** Patreon role sync */
  patreonRoleSync: boolean;

  /** Patreon goal channel */
  patreonGoalChannel: bigint;

  /** Patreon stats channel */
  patreonStatsChannel: bigint;

  // Wizard Settings
  /** Wizard completed */
  wizardCompleted: boolean;

  /** Wizard completed at */
  wizardCompletedAt: string | null;

  /** Wizard completed by user ID */
  wizardCompletedByUserId: bigint;

  /** Wizard skipped */
  wizardSkipped: boolean;

  /** Has basic setup */
  hasBasicSetup: boolean;
}
