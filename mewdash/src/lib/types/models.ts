
export interface DbEntity {
    id: string;
}

export interface GuildConfig extends DbEntity {
    GuildId: string;
    Prefix: string;
    StaffRole: string;
    GameMasterRole: string;
    CommandLogChannel: string;
    DeleteMessageOnCommand: boolean;
    WarnMessage: string;
    DelMsgOnCmdChannels: string[];
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
    WarnPunishments2: WarningPunishment2[];
    Stars: number;
    AfkType: number;
    AntiAltSetting: AntiAltSetting;
    AfkDisabledChannels: string;
    AfkDel: string;
    AfkTimeout: number;
    Joins: string;
    Leaves: string;
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
    LogSetting: LogSetting;
    ExclusiveSelfAssignedRoles: boolean;
    AutoDeleteSelfAssignedRoleMessages: boolean;
    LogSettingId: number | null;
    FollowedStreams: FollowedStream[];
    Permissions: Permissionv2[] | null;
    VerbosePermissions: boolean;
    PermissionRole: string | null;
    CommandCooldowns: CommandCooldown[];
    FilterInvites: boolean;
    FilterLinks: boolean;
    FilterInvitesChannelIds: FilterInvitesChannelIds[];
    FilterLinksChannelIds: FilterLinksChannelId[];
    FilterWords: boolean;
    FilteredWords: FilteredWord[];
    FilterWordsChannelIds: FilterWordsChannelIds[];
    MutedUsers: MutedUserId[];
    MuteRoleName: string | null;
    CleverbotChannel: string;
    GuildRepeaters: Repeater[];
    AntiRaidSetting: AntiRaidSetting;
    AntiSpamSetting: AntiSpamSetting;
    Locale: string | null;
    TimeZoneId: string | null;
    UnmuteTimers: UnmuteTimer[];
    UnbanTimer: UnbanTimer[];
    UnroleTimer: UnroleTimer[];
    VcRoleInfos: VcRoleInfo[];
    CommandAliases: CommandAlias[];
    WarnPunishments: WarningPunishment[];
    WarningsInitialized: boolean;
    NsfwBlacklistedTags: NsfwBlacklitedTag[];
    GameVoiceChannel: string | null;
    VerboseErrors: boolean;
    StreamRole: StreamRoleSettings | null;
    XpSettings: XpSettings | null;
    FeedSubs: FeedSub[];
    ReactionRoleMessages: ReactionRoleMessage[];
    NotifyStreamOffline: boolean;
    SelfAssignableRoleGroupNames: GroupName[];
    WarnExpireHours: number;
    WarnExpireAction: WarnExpireAction;
    JoinGraphColor: number;
    LeaveGraphColor: number;
}

export interface ChatTriggers extends DbEntity {
    UseCount: string;
    IsRegex: boolean;
    OwnerOnly: boolean;
    GuildId: string | null;
    Response: string | null;
    Trigger: string | null;
    PrefixType: RequirePrefixType;
    CustomPrefix: string | null;
    AutoDeleteTrigger: boolean;
    ReactToTrigger: boolean;
    NoRespond: boolean;
    DmResponse: boolean;
    ContainsAnywhere: boolean;
    AllowTarget: boolean;
    Reactions: string | null;
    GrantedRoles: string | null;
    RemovedRoles: string | null;
    RoleGrantType: CtRoleGrantType;
    ValidTriggerTypes: ChatTriggerType;
    ApplicationCommandId: string;
    ApplicationCommandName: string | null;
    ApplicationCommandDescription: string | null;
    ApplicationCommandType: CtApplicationCommandType;
    EphemeralResponse: boolean;
    CrosspostingChannelId: string;
    CrosspostingWebhookUrl: string | null;
}

export enum RequirePrefixType {
    None,
    Global,
    GuildOrGlobal,
    GuildOrNone,
    Custom
}

export enum CtRoleGrantType {
    Sender,
    Mentioned,
    Both
}

export enum ChatTriggerType {
    Message = 1,
    Interaction = 2,
    Button = 4
}

export enum CtApplicationCommandType {
    None,
    Slash,
    Message,
    User
}

export enum WarnExpireAction {
    Clear,
    Warn
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

// Add interfaces for other types used in GuildConfig
export interface WarningPunishment2 {}
export interface AntiAltSetting {}
export interface LogSetting {}
export interface FollowedStream {}
export interface Permissionv2 {}
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