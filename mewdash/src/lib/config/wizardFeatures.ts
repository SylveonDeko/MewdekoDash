import { m } from "$lib/i18n";

/** Formats an estimated setup time as "2-3 min" or "2 min". */
function setupTime(min: number, max?: number): string {
  return max === undefined ? m.features.setupTimeSingle({ minutes: min }) : m.features.setupTimeRange({ min, max });
}

/**
 * Single source of truth for the setup wizard's feature catalog.
 *
 * The wizard page renders these definitions directly, so adding a feature here
 * is enough to surface it in feature selection, progress titles and the
 * completion summary. The matching persistence logic lives in the
 * `configureFeature` switch in `src/routes/wizard/+page.svelte`, keyed by `id`.
 */

/** How much work a feature's full setup involves. */
export type WizardDifficulty = "easy" | "medium" | "advanced";

/** Which built-in editor a configuration step renders. */
export type WizardStepComponent = "channel" | "message" | "embed" | "custom";

/** One screen inside a feature's full setup flow. */
export interface WizardFeatureStep {
  id: string;
  title: string;
  description: string;
  component: WizardStepComponent;
}

/** A feature the wizard can enable and configure. */
export interface WizardFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  recommended: boolean;
  /**
   * Preselected as "quick" so the feature screen arrives with a working answer rather
   * than 26 skipped toggles. Only set this where quick mode actually produces a working
   * configuration: either the defaults are enough, or the only missing piece is a channel,
   * which the bulk setup screen collects. Features needing a role or other specific input
   * silently no-op when quick-enabled, so they stay opt-in even when recommended.
   */
  quickSafe?: boolean;
  difficulty: WizardDifficulty;
  setupTime: string;
  /** Estimated setup time in minutes (upper bound of the displayed range), used for totals. */
  setupMinutes: number;
  benefits: string[];
  steps: WizardFeatureStep[];
}

/** A named grouping of features shown as one collapsible section. */
export interface WizardFeatureCategory {
  /** Stable key (also matched on by the wizard page); display `label` instead. */
  name: string;
  label: string;
  description: string;
  features: WizardFeature[];
}

/** A single Discord event that can be routed to a log channel. */
export interface WizardLoggingEvent {
  id: string;
  name: string;
  icon: string;
  description: string;
  enabled: boolean;
  channelId: string | null;
  category: string;
  /** Localized display label for {@link category}; `category` itself is the matching key. */
  categoryLabel: string;
}

/**
 * Every log type the bot supports, grouped for the bulk logging configurator.
 * Ids must match `Mewdeko.Modules.Administration.Services.LogCommandService.LogType`.
 */
export const wizardLoggingEvents: WizardLoggingEvent[] = [
  {
    id: "UserJoined",
    get name() { return m.features.wizardUserJoinedName(); },
    icon: "fa-utility-duo fa-regular fa-user-plus",
    get description() { return m.features.wizardUserJoinedDescription(); },
    enabled: true,
    channelId: null,
    category: "Members",
    get categoryLabel() { return m.features.categoryMembers(); }
  },
  {
    id: "UserLeft",
    get name() { return m.features.wizardUserLeftName(); },
    icon: "fa-utility-duo fa-regular fa-user-minus",
    get description() { return m.features.wizardUserLeftDescription(); },
    enabled: true,
    channelId: null,
    category: "Members",
    get categoryLabel() { return m.features.categoryMembers(); }
  },
  {
    id: "MessageDeleted",
    get name() { return m.features.wizardMessageDeletedName(); },
    icon: "fa-utility-duo fa-regular fa-trash",
    get description() { return m.features.wizardMessageDeletedDescription(); },
    enabled: true,
    channelId: null,
    category: "Messages",
    get categoryLabel() { return m.features.categoryMessages(); }
  },
  {
    id: "MessagesBulkDeleted",
    get name() { return m.features.wizardMessagesBulkDeletedName(); },
    icon: "fa-utility-duo fa-regular fa-trash",
    get description() { return m.features.wizardMessagesBulkDeletedDescription(); },
    enabled: true,
    channelId: null,
    category: "Messages",
    get categoryLabel() { return m.features.categoryMessages(); }
  },
  {
    id: "UserBanned",
    get name() { return m.features.wizardUserBannedName(); },
    icon: "fa-utility-duo fa-regular fa-shield-slash",
    get description() { return m.features.wizardUserBannedDescription(); },
    enabled: true,
    channelId: null,
    category: "Moderation",
    get categoryLabel() { return m.features.categoryModeration(); }
  },
  {
    id: "UserUnbanned",
    get name() { return m.features.wizardUserUnbannedName(); },
    icon: "fa-utility-duo fa-regular fa-circle-check",
    get description() { return m.features.wizardUserUnbannedDescription(); },
    enabled: false,
    channelId: null,
    category: "Moderation",
    get categoryLabel() { return m.features.categoryModeration(); }
  },
  {
    id: "UserMuted",
    get name() { return m.features.wizardUserMutedName(); },
    icon: "fa-utility-duo fa-regular fa-volume-slash",
    get description() { return m.features.wizardUserMutedDescription(); },
    enabled: false,
    channelId: null,
    category: "Moderation",
    get categoryLabel() { return m.features.categoryModeration(); }
  },
  {
    id: "UserRoleAdded",
    get name() { return m.features.wizardUserRoleAddedName(); },
    icon: "fa-utility-duo fa-regular fa-crown",
    get description() { return m.features.wizardUserRoleAddedDescription(); },
    enabled: false,
    channelId: null,
    category: "Members",
    get categoryLabel() { return m.features.categoryMembers(); }
  },
  {
    id: "UserRoleRemoved",
    get name() { return m.features.wizardUserRoleRemovedName(); },
    icon: "fa-utility-duo fa-regular fa-crown",
    get description() { return m.features.wizardUserRoleRemovedDescription(); },
    enabled: false,
    channelId: null,
    category: "Members",
    get categoryLabel() { return m.features.categoryMembers(); }
  },
  {
    id: "MessageUpdated",
    get name() { return m.features.wizardMessageUpdatedName(); },
    icon: "fa-utility-duo fa-regular fa-pen-to-square",
    get description() { return m.features.wizardMessageUpdatedDescription(); },
    enabled: false,
    channelId: null,
    category: "Messages",
    get categoryLabel() { return m.features.categoryMessages(); }
  },
  {
    id: "ReactionEvents",
    get name() { return m.features.wizardReactionEventsName(); },
    icon: "fa-utility-duo fa-regular fa-face-smile",
    get description() { return m.features.wizardReactionEventsDescription(); },
    enabled: false,
    channelId: null,
    category: "Messages",
    get categoryLabel() { return m.features.categoryMessages(); }
  },
  {
    id: "UsernameUpdated",
    get name() { return m.features.wizardUsernameUpdatedName(); },
    icon: "fa-utility-duo fa-regular fa-user",
    get description() { return m.features.wizardUsernameUpdatedDescription(); },
    enabled: false,
    channelId: null,
    category: "Profile",
    get categoryLabel() { return m.features.categoryProfile(); }
  },
  {
    id: "NicknameUpdated",
    get name() { return m.features.wizardNicknameUpdatedName(); },
    icon: "fa-utility-duo fa-regular fa-id-card",
    get description() { return m.features.wizardNicknameUpdatedDescription(); },
    enabled: false,
    channelId: null,
    category: "Profile",
    get categoryLabel() { return m.features.categoryProfile(); }
  },
  {
    id: "AvatarUpdated",
    get name() { return m.features.wizardAvatarUpdatedName(); },
    icon: "fa-utility-duo fa-regular fa-image",
    get description() { return m.features.wizardAvatarUpdatedDescription(); },
    enabled: false,
    channelId: null,
    category: "Profile",
    get categoryLabel() { return m.features.categoryProfile(); }
  },
  {
    id: "ChannelCreated",
    get name() { return m.features.wizardChannelCreatedName(); },
    icon: "fa-utility-duo fa-regular fa-circle-plus",
    get description() { return m.features.wizardChannelCreatedDescription(); },
    enabled: false,
    channelId: null,
    category: "Server",
    get categoryLabel() { return m.features.categoryServer(); }
  },
  {
    id: "ChannelDestroyed",
    get name() { return m.features.wizardChannelDestroyedName(); },
    icon: "fa-utility-duo fa-regular fa-trash",
    get description() { return m.features.wizardChannelDestroyedDescription(); },
    enabled: false,
    channelId: null,
    category: "Server",
    get categoryLabel() { return m.features.categoryServer(); }
  },
  {
    id: "ChannelUpdated",
    get name() { return m.features.wizardChannelUpdatedName(); },
    icon: "fa-utility-duo fa-regular fa-pen-to-square",
    get description() { return m.features.wizardChannelUpdatedDescription(); },
    enabled: false,
    channelId: null,
    category: "Server",
    get categoryLabel() { return m.features.categoryServer(); }
  },
  {
    id: "RoleCreated",
    get name() { return m.features.wizardRoleCreatedName(); },
    icon: "fa-utility-duo fa-regular fa-crown",
    get description() { return m.features.wizardRoleCreatedDescription(); },
    enabled: false,
    channelId: null,
    category: "Server",
    get categoryLabel() { return m.features.categoryServer(); }
  },
  {
    id: "RoleDeleted",
    get name() { return m.features.wizardRoleDeletedName(); },
    icon: "fa-utility-duo fa-regular fa-crown",
    get description() { return m.features.wizardRoleDeletedDescription(); },
    enabled: false,
    channelId: null,
    category: "Server",
    get categoryLabel() { return m.features.categoryServer(); }
  },
  {
    id: "RoleUpdated",
    get name() { return m.features.wizardRoleUpdatedName(); },
    icon: "fa-utility-duo fa-regular fa-crown",
    get description() { return m.features.wizardRoleUpdatedDescription(); },
    enabled: false,
    channelId: null,
    category: "Server",
    get categoryLabel() { return m.features.categoryServer(); }
  },
  {
    id: "ThreadCreated",
    get name() { return m.features.wizardThreadCreatedName(); },
    icon: "fa-utility-duo fa-regular fa-comments",
    get description() { return m.features.wizardThreadCreatedDescription(); },
    enabled: false,
    channelId: null,
    category: "Server",
    get categoryLabel() { return m.features.categoryServer(); }
  },
  {
    id: "ThreadDeleted",
    get name() { return m.features.wizardThreadDeletedName(); },
    icon: "fa-utility-duo fa-regular fa-comments",
    get description() { return m.features.wizardThreadDeletedDescription(); },
    enabled: false,
    channelId: null,
    category: "Server",
    get categoryLabel() { return m.features.categoryServer(); }
  },
  {
    id: "ThreadUpdated",
    get name() { return m.features.wizardThreadUpdatedName(); },
    icon: "fa-utility-duo fa-regular fa-comments",
    get description() { return m.features.wizardThreadUpdatedDescription(); },
    enabled: false,
    channelId: null,
    category: "Server",
    get categoryLabel() { return m.features.categoryServer(); }
  },
  {
    id: "InviteCreated",
    get name() { return m.features.wizardInviteCreatedName(); },
    icon: "fa-utility-duo fa-regular fa-link",
    get description() { return m.features.wizardInviteCreatedDescription(); },
    enabled: false,
    channelId: null,
    category: "Server",
    get categoryLabel() { return m.features.categoryServer(); }
  },
  {
    id: "InviteDeleted",
    get name() { return m.features.wizardInviteDeletedName(); },
    icon: "fa-utility-duo fa-regular fa-chain",
    get description() { return m.features.wizardInviteDeletedDescription(); },
    enabled: false,
    channelId: null,
    category: "Server",
    get categoryLabel() { return m.features.categoryServer(); }
  },
  {
    id: "VoicePresence",
    get name() { return m.features.wizardVoicePresenceName(); },
    icon: "fa-utility-duo fa-regular fa-microphone",
    get description() { return m.features.wizardVoicePresenceDescription(); },
    enabled: false,
    channelId: null,
    category: "Voice",
    get categoryLabel() { return m.features.categoryVoice(); }
  },
  {
    id: "VoicePresenceTts",
    get name() { return m.features.wizardVoicePresenceTtsName(); },
    icon: "fa-utility-duo fa-regular fa-volume",
    get description() { return m.features.wizardVoicePresenceTtsDescription(); },
    enabled: false,
    channelId: null,
    category: "Voice",
    get categoryLabel() { return m.features.categoryVoice(); }
  },
  {
    id: "ServerUpdated",
    get name() { return m.features.wizardServerUpdatedName(); },
    icon: "fa-utility-duo fa-regular fa-gear",
    get description() { return m.features.wizardServerUpdatedDescription(); },
    enabled: false,
    channelId: null,
    category: "Server",
    get categoryLabel() { return m.features.categoryServer(); }
  },
  {
    id: "EventCreated",
    get name() { return m.features.wizardEventCreatedName(); },
    icon: "fa-utility-duo fa-regular fa-calendar",
    get description() { return m.features.wizardEventCreatedDescription(); },
    enabled: false,
    channelId: null,
    category: "Server",
    get categoryLabel() { return m.features.categoryServer(); }
  },
  {
    id: "Other",
    get name() { return m.features.wizardOtherName(); },
    icon: "fa-utility-duo fa-regular fa-circle-info",
    get description() { return m.features.wizardOtherDescription(); },
    enabled: false,
    channelId: null,
    category: "Server",
    get categoryLabel() { return m.features.categoryServer(); }
  }
];

/** The wizard's feature catalog, in the order the categories are shown. */
export const wizardFeatureCategories: WizardFeatureCategory[] = [
  {
    name: "Essential",
    get label() { return m.features.categoryEssential(); },
    get description() { return m.features.categoryEssentialDescription(); },
    features: [
      {
        id: "multigreets",
        get title() { return m.features.wizardMultigreetsName(); },
        get description() { return m.features.wizardMultigreetsDescription(); },
        icon: "fa-utility-duo fa-regular fa-bell",
        recommended: true,
        quickSafe: true,
        difficulty: "easy",
        setupMinutes: 5,
        get setupTime() { return setupTime(3, 5); },
        get benefits() {
          return [
            m.features.wizardMultigreetsBenefit1(),
            m.features.wizardMultigreetsBenefit2(),
            m.features.wizardMultigreetsBenefit3(),
            m.features.wizardMultigreetsBenefit4()
          ];
        },
        steps: [
          {
            id: "channel",
            get title() { return m.features.wizardMultigreetsStepChannelTitle(); },
            get description() { return m.features.wizardMultigreetsStepChannelDescription(); },
            component: "channel"
          },
          {
            id: "message",
            get title() { return m.features.wizardMultigreetsStepMessageTitle(); },
            get description() { return m.features.wizardMultigreetsStepMessageDescription(); },
            component: "message"
          }
        ]
      },
      {
        id: "protection",
        get title() { return m.features.wizardProtectionName(); },
        get description() { return m.features.wizardProtectionDescription(); },
        icon: "fa-utility-duo fa-regular fa-shield-halved",
        recommended: true,
        quickSafe: true,
        difficulty: "medium",
        setupMinutes: 5,
        get setupTime() { return setupTime(3, 5); },
        get benefits() {
          return [
            m.features.wizardProtectionBenefit1(),
            m.features.wizardProtectionBenefit2(),
            m.features.wizardProtectionBenefit3(),
            m.features.wizardProtectionBenefit4()
          ];
        },
        steps: [
          {
            id: "raid",
            get title() { return m.features.wizardProtectionStepRaidTitle(); },
            get description() { return m.features.wizardProtectionStepRaidDescription(); },
            component: "custom"
          },
          {
            id: "alts",
            get title() { return m.features.wizardProtectionStepAltsTitle(); },
            get description() { return m.features.wizardProtectionStepAltsDescription(); },
            component: "custom"
          }
        ]
      },
      {
        id: "rolegreets",
        get title() { return m.features.wizardRolegreetsName(); },
        get description() { return m.features.wizardRolegreetsDescription(); },
        icon: "fa-utility-duo fa-regular fa-user",
        recommended: true,
        difficulty: "easy",
        setupMinutes: 4,
        get setupTime() { return setupTime(2, 4); },
        get benefits() {
          return [
            m.features.wizardRolegreetsBenefit1(),
            m.features.wizardRolegreetsBenefit2(),
            m.features.wizardRolegreetsBenefit3(),
            m.features.wizardRolegreetsBenefit4()
          ];
        },
        steps: [
          {
            id: "role",
            get title() { return m.features.wizardRolegreetsStepRoleTitle(); },
            get description() { return m.features.wizardRolegreetsStepRoleDescription(); },
            component: "custom"
          },
          {
            id: "channel",
            get title() { return m.features.wizardRolegreetsStepChannelTitle(); },
            get description() { return m.features.wizardRolegreetsStepChannelDescription(); },
            component: "channel"
          },
          {
            id: "message",
            get title() { return m.features.wizardMultigreetsStepMessageTitle(); },
            get description() { return m.features.wizardRolegreetsStepMessageDescription(); },
            component: "message"
          }
        ]
      },
      {
        id: "logging",
        get title() { return m.features.wizardLoggingName(); },
        get description() { return m.features.wizardLoggingDescription(); },
        icon: "fa-utility-duo fa-regular fa-file",
        recommended: true,
        quickSafe: true,
        difficulty: "easy",
        setupMinutes: 3,
        get setupTime() { return setupTime(2, 3); },
        get benefits() {
          return [
            m.features.wizardLoggingBenefit1(),
            m.features.wizardLoggingBenefit2(),
            m.features.wizardLoggingBenefit3(),
            m.features.wizardLoggingBenefit4()
          ];
        },
        steps: [
          {
            id: "channels",
            get title() { return m.features.wizardLoggingStepChannelsTitle(); },
            get description() { return m.features.wizardLoggingStepChannelsDescription(); },
            component: "custom"
          }
        ]
      },
      {
        id: "administration",
        get title() { return m.features.wizardAdministrationName(); },
        get description() { return m.features.wizardAdministrationDescription(); },
        icon: "fa-utility-duo fa-regular fa-cog",
        recommended: false,
        difficulty: "easy",
        setupMinutes: 3,
        get setupTime() { return setupTime(2, 3); },
        get benefits() {
          return [
            m.features.wizardAdministrationBenefit1(),
            m.features.wizardAdministrationBenefit2(),
            m.features.wizardAdministrationBenefit3(),
            m.features.wizardAdministrationBenefit4()
          ];
        },
        steps: [
          {
            id: "roles",
            get title() { return m.features.wizardAdministrationStepRolesTitle(); },
            get description() { return m.features.wizardAdministrationStepRolesDescription(); },
            component: "custom"
          }
        ]
      }
    ]
  },
  {
    name: "Moderation & Support",
    get label() { return m.features.categoryModerationSupport(); },
    get description() { return m.features.categoryModerationSupportDescription(); },
    features: [
      {
        id: "moderation",
        get title() { return m.features.wizardModerationName(); },
        get description() { return m.features.wizardModerationDescription(); },
        icon: "fa-utility-duo fa-regular fa-flag",
        recommended: false,
        difficulty: "medium",
        setupMinutes: 5,
        get setupTime() { return setupTime(3, 5); },
        get benefits() {
          return [
            m.features.wizardModerationBenefit1(),
            m.features.wizardModerationBenefit2(),
            m.features.wizardModerationBenefit3(),
            m.features.wizardModerationBenefit4()
          ];
        },
        steps: [
          {
            id: "config",
            get title() { return m.features.wizardModerationStepConfigTitle(); },
            get description() { return m.features.wizardModerationStepConfigDescription(); },
            component: "custom"
          }
        ]
      },
      {
        id: "tickets",
        get title() { return m.features.wizardTicketsName(); },
        get description() { return m.features.wizardTicketsDescription(); },
        icon: "fa-utility-duo fa-regular fa-ticket",
        recommended: false,
        quickSafe: true,
        difficulty: "medium",
        setupMinutes: 5,
        get setupTime() { return setupTime(3, 5); },
        get benefits() {
          return [
            m.features.wizardTicketsBenefit1(),
            m.features.wizardTicketsBenefit2(),
            m.features.wizardTicketsBenefit3(),
            m.features.wizardTicketsBenefit4()
          ];
        },
        steps: [
          {
            id: "panel",
            get title() { return m.features.wizardTicketsStepPanelTitle(); },
            get description() { return m.features.wizardTicketsStepPanelDescription(); },
            component: "custom"
          }
        ]
      },
      {
        id: "rolestates",
        get title() { return m.features.wizardRolestatesName(); },
        get description() { return m.features.wizardRolestatesDescription(); },
        icon: "fa-utility-duo fa-regular fa-clipboard-check",
        recommended: false,
        difficulty: "easy",
        setupMinutes: 2,
        get setupTime() { return setupTime(1, 2); },
        get benefits() {
          return [
            m.features.wizardRolestatesBenefit1(),
            m.features.wizardRolestatesBenefit2(),
            m.features.wizardRolestatesBenefit3(),
            m.features.wizardRolestatesBenefit4()
          ];
        },
        steps: [
          {
            id: "config",
            get title() { return m.features.wizardRolestatesStepConfigTitle(); },
            get description() { return m.features.wizardRolestatesStepConfigDescription(); },
            component: "custom"
          }
        ]
      }
    ]
  },
  {
    name: "Community Growth",
    get label() { return m.features.categoryCommunityGrowth(); },
    get description() { return m.features.categoryCommunityGrowthDescription(); },
    features: [
      {
        id: "xp",
        get title() { return m.features.wizardXpName(); },
        get description() { return m.features.wizardXpDescription(); },
        icon: "fa-utility-duo fa-regular fa-star",
        recommended: false,
        difficulty: "medium",
        setupMinutes: 8,
        get setupTime() { return setupTime(5, 8); },
        get benefits() {
          return [
            m.features.wizardXpBenefit1(),
            m.features.wizardXpBenefit2(),
            m.features.wizardXpBenefit3(),
            m.features.wizardXpBenefit4()
          ];
        },
        steps: [
          { id: "rates", title: "XP Rates", description: "Configure XP earning rates", component: "custom" },
          {
            id: "rewards",
            get title() { return m.features.wizardXpStepRewardsTitle(); },
            get description() { return m.features.wizardXpStepRewardsDescription(); },
            component: "custom"
          },
          {
            id: "exclusions",
            get title() { return m.features.wizardXpStepExclusionsTitle(); },
            get description() { return m.features.wizardXpStepExclusionsDescription(); },
            component: "custom"
          }
        ]
      },
      {
        id: "starboard",
        get title() { return m.features.starboardName(); },
        get description() { return m.features.wizardStarboardDescription(); },
        icon: "fa-utility-duo fa-regular fa-star",
        recommended: false,
        quickSafe: true,
        difficulty: "easy",
        setupMinutes: 3,
        get setupTime() { return setupTime(2, 3); },
        get benefits() {
          return [
            m.features.wizardStarboardBenefit1(),
            m.features.wizardStarboardBenefit2(),
            m.features.wizardStarboardBenefit3(),
            m.features.wizardStarboardBenefit4()
          ];
        },
        steps: [
          {
            id: "config",
            get title() { return m.features.wizardStarboardStepConfigTitle(); },
            get description() { return m.features.wizardStarboardStepConfigDescription(); },
            component: "custom"
          }
        ]
      },
      {
        id: "suggestions",
        get title() { return m.features.suggestionsName(); },
        get description() { return m.features.wizardSuggestionsDescription(); },
        icon: "fa-utility-duo fa-regular fa-lightbulb",
        recommended: false,
        quickSafe: true,
        difficulty: "easy",
        setupMinutes: 4,
        get setupTime() { return setupTime(2, 4); },
        get benefits() {
          return [
            m.features.wizardSuggestionsBenefit1(),
            m.features.wizardSuggestionsBenefit2(),
            m.features.wizardSuggestionsBenefit3(),
            m.features.wizardSuggestionsBenefit4()
          ];
        },
        steps: [
          {
            id: "channels",
            get title() { return m.features.wizardSuggestionsStepChannelsTitle(); },
            get description() { return m.features.wizardSuggestionsStepChannelsDescription(); },
            component: "custom"
          }
        ]
      },
      {
        id: "giveaways",
        get title() { return m.features.giveawaysName(); },
        get description() { return m.features.wizardGiveawaysDescription(); },
        icon: "fa-utility-duo fa-regular fa-gift",
        recommended: false,
        difficulty: "easy",
        setupMinutes: 0,
        get setupTime() { return m.common.notAvailable(); },
        get benefits() {
          return [
            m.features.wizardGiveawaysBenefit1(),
            m.features.wizardGiveawaysBenefit2(),
            m.features.wizardGiveawaysBenefit3(),
            m.features.wizardGiveawaysBenefit4(),
            m.features.wizardGiveawaysBenefit5()
          ];
        },
        steps: []
      },
      {
        id: "confessions",
        get title() { return m.features.wizardConfessionsName(); },
        get description() { return m.features.wizardConfessionsDescription(); },
        icon: "fa-utility-duo fa-regular fa-comment",
        recommended: false,
        quickSafe: true,
        difficulty: "easy",
        setupMinutes: 3,
        get setupTime() { return setupTime(2, 3); },
        get benefits() {
          return [
            m.features.wizardConfessionsBenefit1(),
            m.features.wizardConfessionsBenefit2(),
            m.features.wizardConfessionsBenefit3(),
            m.features.wizardConfessionsBenefit4()
          ];
        },
        steps: [
          {
            id: "config",
            get title() { return m.features.wizardConfessionsStepConfigTitle(); },
            get description() { return m.features.wizardConfessionsStepConfigDescription(); },
            component: "custom"
          }
        ]
      },
      {
        id: "counting",
        get title() { return m.features.wizardCountingName(); },
        get description() { return m.features.wizardCountingDescription(); },
        icon: "fa-utility-duo fa-regular fa-list-numeric",
        recommended: false,
        quickSafe: true,
        difficulty: "easy",
        setupMinutes: 1,
        get setupTime() { return setupTime(1); },
        get benefits() {
          return [
            m.features.wizardCountingBenefit1(),
            m.features.wizardCountingBenefit2(),
            m.features.wizardCountingBenefit3(),
            m.features.wizardCountingBenefit4()
          ];
        },
        steps: [
          {
            id: "channel",
            get title() { return m.features.wizardCountingStepChannelTitle(); },
            get description() { return m.features.wizardCountingStepChannelDescription(); },
            component: "channel"
          }
        ]
      },
      {
        id: "birthday",
        get title() { return m.features.wizardBirthdayName(); },
        get description() { return m.features.wizardBirthdayDescription(); },
        icon: "fa-utility-duo fa-regular fa-birthday-cake",
        recommended: false,
        quickSafe: true,
        difficulty: "easy",
        setupMinutes: 4,
        get setupTime() { return setupTime(3, 4); },
        get benefits() {
          return [
            m.features.wizardBirthdayBenefit1(),
            m.features.wizardBirthdayBenefit2(),
            m.features.wizardBirthdayBenefit3(),
            m.features.wizardBirthdayBenefit4()
          ];
        },
        steps: [
          {
            id: "channel",
            get title() { return m.features.wizardBirthdayStepChannelTitle(); },
            get description() { return m.features.wizardBirthdayStepChannelDescription(); },
            component: "custom"
          },
          {
            id: "message",
            get title() { return m.features.wizardBirthdayStepMessageTitle(); },
            get description() { return m.features.wizardBirthdayStepMessageDescription(); },
            component: "message"
          }
        ]
      },
      {
        id: "reputation",
        get title() { return m.features.reputationName(); },
        get description() { return m.features.wizardReputationDescription(); },
        icon: "fa-utility-duo fa-regular fa-thumbs-up",
        recommended: false,
        quickSafe: true,
        difficulty: "easy",
        setupMinutes: 3,
        get setupTime() { return setupTime(2, 3); },
        get benefits() {
          return [
            m.features.wizardReputationBenefit1(),
            m.features.wizardReputationBenefit2(),
            m.features.wizardReputationBenefit3(),
            m.features.wizardReputationBenefit4()
          ];
        },
        steps: [
          {
            id: "config",
            get title() { return m.features.wizardReputationStepConfigTitle(); },
            get description() { return m.features.wizardReputationStepConfigDescription(); },
            component: "custom"
          }
        ]
      }
    ]
  },
  {
    name: "Roles & Access",
    get label() { return m.features.categoryRolesAccess(); },
    get description() { return m.features.categoryRolesAccessDescription(); },
    features: [
      {
        id: "roles",
        get title() { return m.features.wizardRolesName(); },
        get description() { return m.features.wizardRolesDescription(); },
        icon: "fa-utility-duo fa-regular fa-crown",
        recommended: true,
        difficulty: "easy",
        setupMinutes: 4,
        get setupTime() { return setupTime(2, 4); },
        get benefits() {
          return [
            m.features.wizardRolesBenefit1(),
            m.features.wizardRolesBenefit2(),
            m.features.wizardRolesBenefit3(),
            m.features.wizardRolesBenefit4()
          ];
        },
        steps: [
          {
            id: "core",
            get title() { return m.features.wizardRolesStepCoreTitle(); },
            get description() { return m.features.wizardRolesStepCoreDescription(); },
            component: "custom"
          },
          {
            id: "selfassign",
            get title() { return m.features.wizardRolesStepSelfassignTitle(); },
            get description() { return m.features.wizardRolesStepSelfassignDescription(); },
            component: "custom"
          }
        ]
      },
      {
        id: "statusroles",
        get title() { return m.features.statusrolesName(); },
        get description() { return m.features.wizardStatusrolesDescription(); },
        icon: "fa-utility-duo fa-regular fa-circle-user",
        recommended: false,
        difficulty: "easy",
        setupMinutes: 2,
        get setupTime() { return setupTime(2); },
        get benefits() {
          return [
            m.features.wizardStatusrolesBenefit1(),
            m.features.wizardStatusrolesBenefit2(),
            m.features.wizardStatusrolesBenefit3(),
            m.features.wizardStatusrolesBenefit4()
          ];
        },
        steps: [
          {
            id: "config",
            get title() { return m.features.wizardStatusrolesStepConfigTitle(); },
            get description() { return m.features.wizardStatusrolesStepConfigDescription(); },
            component: "custom"
          }
        ]
      },
      {
        id: "customvoice",
        get title() { return m.features.customvoiceDescription(); },
        get description() { return m.features.wizardCustomvoiceDescription(); },
        icon: "fa-utility-duo fa-regular fa-microphone",
        recommended: false,
        difficulty: "medium",
        setupMinutes: 4,
        get setupTime() { return setupTime(3, 4); },
        get benefits() {
          return [
            m.features.wizardCustomvoiceBenefit1(),
            m.features.wizardCustomvoiceBenefit2(),
            m.features.wizardCustomvoiceBenefit3(),
            m.features.wizardCustomvoiceBenefit4()
          ];
        },
        steps: [
          {
            id: "hub",
            get title() { return m.features.wizardCustomvoiceStepHubTitle(); },
            get description() { return m.features.wizardCustomvoiceStepHubDescription(); },
            component: "custom"
          }
        ]
      }
    ]
  },
  {
    name: "Notifications & Content",
    get label() { return m.features.categoryNotificationsContent(); },
    get description() { return m.features.categoryNotificationsContentDescription(); },
    features: [
      {
        id: "feeds",
        get title() { return m.features.wizardFeedsName(); },
        get description() { return m.features.wizardFeedsDescription(); },
        icon: "fa-utility-duo fa-regular fa-newspaper",
        recommended: false,
        difficulty: "easy",
        setupMinutes: 3,
        get setupTime() { return setupTime(2, 3); },
        get benefits() {
          return [
            m.features.wizardFeedsBenefit1(),
            m.features.wizardFeedsBenefit2(),
            m.features.wizardFeedsBenefit3(),
            m.features.wizardFeedsBenefit4()
          ];
        },
        steps: [
          {
            id: "feeds",
            get title() { return m.features.wizardFeedsStepFeedsTitle(); },
            get description() { return m.features.wizardFeedsStepFeedsDescription(); },
            component: "custom"
          }
        ]
      },
      {
        id: "streams",
        get title() { return m.features.wizardStreamsName(); },
        get description() { return m.features.wizardStreamsDescription(); },
        icon: "fa-utility-duo fa-regular fa-video",
        recommended: false,
        difficulty: "easy",
        setupMinutes: 3,
        get setupTime() { return setupTime(2, 3); },
        get benefits() {
          return [
            m.features.wizardStreamsBenefit1(),
            m.features.wizardStreamsBenefit2(),
            m.features.wizardStreamsBenefit3(),
            m.features.wizardStreamsBenefit4()
          ];
        },
        steps: [
          {
            id: "streams",
            get title() { return m.features.wizardStreamsStepStreamsTitle(); },
            get description() { return m.features.wizardStreamsStepStreamsDescription(); },
            component: "custom"
          }
        ]
      },
      {
        id: "repeaters",
        get title() { return m.features.wizardRepeatersName(); },
        get description() { return m.features.wizardRepeatersDescription(); },
        icon: "fa-utility-duo fa-regular fa-arrows-rotate",
        recommended: false,
        difficulty: "easy",
        setupMinutes: 3,
        get setupTime() { return setupTime(2, 3); },
        get benefits() {
          return [
            m.features.wizardRepeatersBenefit1(),
            m.features.wizardRepeatersBenefit2(),
            m.features.wizardRepeatersBenefit3(),
            m.features.wizardRepeatersBenefit4()
          ];
        },
        steps: [
          {
            id: "config",
            get title() { return m.features.wizardRepeatersStepConfigTitle(); },
            get description() { return m.features.wizardRepeatersStepConfigDescription(); },
            component: "custom"
          }
        ]
      },
      {
        id: "votes",
        get title() { return m.features.wizardVotesName(); },
        get description() { return m.features.wizardVotesDescription(); },
        icon: "fa-utility-duo fa-regular fa-heart",
        recommended: false,
        difficulty: "medium",
        setupMinutes: 4,
        get setupTime() { return setupTime(2, 4); },
        get benefits() {
          return [
            m.features.wizardVotesBenefit1(),
            m.features.wizardVotesBenefit2(),
            m.features.wizardVotesBenefit3(),
            m.features.wizardVotesBenefit4()
          ];
        },
        steps: [
          {
            id: "config",
            get title() { return m.features.wizardVotesStepConfigTitle(); },
            get description() { return m.features.wizardVotesStepConfigDescription(); },
            component: "custom"
          }
        ]
      }
    ]
  },
  {
    name: "Server Insights",
    get label() { return m.features.categoryServerInsights(); },
    get description() { return m.features.categoryServerInsightsDescription(); },
    features: [
      {
        id: "statchannels",
        get title() { return m.features.statchannelsName(); },
        get description() { return m.features.wizardStatchannelsDescription(); },
        icon: "fa-utility-duo fa-regular fa-chart-simple",
        recommended: false,
        difficulty: "easy",
        setupMinutes: 2,
        get setupTime() { return setupTime(2); },
        get benefits() {
          return [
            m.features.wizardStatchannelsBenefit1(),
            m.features.wizardStatchannelsBenefit2(),
            m.features.wizardStatchannelsBenefit3(),
            m.features.wizardStatchannelsBenefit4()
          ];
        },
        steps: [
          {
            id: "stats",
            get title() { return m.features.wizardStatchannelsStepStatsTitle(); },
            get description() { return m.features.wizardStatchannelsStepStatsDescription(); },
            component: "custom"
          }
        ]
      },
      {
        id: "invitetracking",
        get title() { return m.features.wizardInvitetrackingName(); },
        get description() { return m.features.wizardInvitetrackingDescription(); },
        icon: "fa-utility-duo fa-regular fa-link",
        recommended: false,
        quickSafe: true,
        difficulty: "easy",
        setupMinutes: 2,
        get setupTime() { return setupTime(1, 2); },
        get benefits() {
          return [
            m.features.wizardInvitetrackingBenefit1(),
            m.features.wizardInvitetrackingBenefit2(),
            m.features.wizardInvitetrackingBenefit3(),
            m.features.wizardInvitetrackingBenefit4()
          ];
        },
        steps: [
          {
            id: "config",
            get title() { return m.features.wizardInvitetrackingStepConfigTitle(); },
            get description() { return m.features.wizardInvitetrackingStepConfigDescription(); },
            component: "custom"
          }
        ]
      },
      {
        id: "afk",
        get title() { return m.features.afkName(); },
        get description() { return m.features.wizardAfkDescription(); },
        icon: "fa-utility-duo fa-regular fa-moon",
        recommended: false,
        difficulty: "easy",
        setupMinutes: 2,
        get setupTime() { return setupTime(1, 2); },
        get benefits() {
          return [
            m.features.wizardAfkBenefit1(),
            m.features.wizardAfkBenefit2(),
            m.features.wizardAfkBenefit3(),
            m.features.wizardAfkBenefit4()
          ];
        },
        steps: [
          {
            id: "config",
            get title() { return m.features.wizardAfkStepConfigTitle(); },
            get description() { return m.features.wizardAfkStepConfigDescription(); },
            component: "custom"
          }
        ]
      }
    ]
  }
];

/** Flat list of every feature across all categories. */
export const allWizardFeatures: WizardFeature[] = wizardFeatureCategories.flatMap(
  (category) => category.features
);

/** Feature selection state as it is stored before setup runs. */
export type WizardFeatureState = "full" | "quick" | "skip";

/**
 * Feature states before the server has been inspected. Everything starts skipped;
 * {@link recommendFeatures} then turns on what suits the server once its channels,
 * roles and size are known.
 */
export function createDefaultFeatureStates(): Record<string, WizardFeatureState> {
  return Object.fromEntries(allWizardFeatures.map((feature) => [feature.id, "skip"]));
}

/** What the wizard knows about a server when deciding what to suggest. */
export interface WizardServerContext {
  memberCount: number;
  channelNames: string[];
  voiceChannelNames: string[];
  categoryNames: string[];
  roleNames: string[];
}

/** A suggested starting state for one feature, and the reason to show for it. */
export interface WizardSuggestion {
  state: WizardFeatureState;
  reason: string;
}

/**
 * Servers below this size are small enough that a burst of legitimate joins looks like
 * a raid, so protection is left for the user to opt into rather than turned on for them.
 */
const PROTECTION_MIN_MEMBERS = 50;

/** Servers past this size are where manual moderation stops scaling. */
const BUSY_SERVER_MEMBERS = 500;

/**
 * Channel, category and role names that indicate a server already wants a feature.
 * A channel called "tickets" is a statement of intent, and matching on it lets the
 * wizard arrive with an opinion rather than 26 identical toggles.
 */
const KEYWORD_RULES: Array<{ feature: string; keywords: string[]; reason: () => string }> = [
  { feature: "tickets", keywords: ["ticket", "support", "modmail", "helpdesk"], reason: () => m.features.wizardReasonExistingTickets() },
  { feature: "suggestions", keywords: ["suggestion", "idea", "feedback"], reason: () => m.features.wizardReasonExistingSuggestions() },
  { feature: "xp", keywords: ["level", "rank", "leaderboard"], reason: () => m.features.wizardReasonExistingXp() },
  { feature: "confessions", keywords: ["confession"], reason: () => m.features.wizardReasonExistingConfessions() },
  { feature: "starboard", keywords: ["starboard", "hall-of-fame", "best-of", "highlight"], reason: () => m.features.wizardReasonExistingStarboard() },
  { feature: "counting", keywords: ["counting"], reason: () => m.features.wizardReasonExistingCounting() },
  { feature: "rolegreets", keywords: ["verify", "verification", "unverified"], reason: () => m.features.wizardReasonExistingRolegreets() },
  { feature: "birthday", keywords: ["birthday"], reason: () => m.features.wizardReasonExistingBirthday() },
  { feature: "giveaways", keywords: ["giveaway"], reason: () => m.features.wizardReasonExistingGiveaways() },
  { feature: "invitetracking", keywords: ["invite"], reason: () => m.features.wizardReasonExistingInvitetracking() },
  { feature: "reputation", keywords: ["reputation", "kudos", "thanks"], reason: () => m.features.wizardReasonExistingReputation() }
];

/**
 * Suggests which features to start enabled, based on what the server looks like.
 *
 * A suggestion only becomes "quick" when the feature can actually be configured from
 * the bulk screen, which collects a channel and nothing else. Features needing a role,
 * a voice channel or a panel are suggested as "full" instead, because quick-enabling
 * them would silently apply nothing.
 * @param context What the wizard knows about the server.
 * @returns The suggested state and reason per feature id.
 */
export function recommendFeatures(context: WizardServerContext): Record<string, WizardSuggestion> {
  const suggestions: Record<string, WizardSuggestion> = {};
  const quickSafeIds = new Set(allWizardFeatures.filter((f) => f.quickSafe).map((f) => f.id));

  // `reason` is a getter so the text is resolved at render time and follows locale switches.
  const suggest = (feature: string, reason: () => string) => {
    if (suggestions[feature]) return;
    suggestions[feature] = {
      state: quickSafeIds.has(feature) ? "quick" : "full",
      get reason() { return reason(); }
    };
  };

  suggest("multigreets", () => m.features.wizardReasonMultigreets());
  suggest("logging", () => m.features.wizardReasonLogging());

  if (context.memberCount >= PROTECTION_MIN_MEMBERS)
    suggest("protection", () => m.features.wizardReasonProtection({ count: context.memberCount.toLocaleString() }));

  if (context.memberCount >= BUSY_SERVER_MEMBERS) {
    suggest("moderation", () => m.features.wizardReasonModeration());
    suggest("tickets", () => m.features.wizardReasonTickets());
  }

  const haystack = [
    ...context.channelNames,
    ...context.voiceChannelNames,
    ...context.categoryNames,
    ...context.roleNames
  ].map((name) => name.toLowerCase());

  for (const rule of KEYWORD_RULES) {
    const match = haystack.find((name) => rule.keywords.some((keyword) => name.includes(keyword)));
    if (match) suggest(rule.feature, rule.reason);
  }

  return suggestions;
}

/**
 * Starting configuration for every feature.
 *
 * Quick Enable applies these values verbatim, so each default must be safe to
 * write to a server with no further input from the user.
 */
export function createDefaultFeatureConfigs(): Record<string, any> {
  return {
    multigreets: {
      channelId: null,
      channelIds: [],
      message: { content: m.features.defaultMultigreetMessage() },
      applyToMultiple: false
    },
    rolegreets: {
      roleId: null,
      channelId: null,
      message: { content: m.features.defaultRolegreetMessage() }
    },
    logging: {},
    administration: {
      normalRoles: [],
      botRoles: []
    },
    protection: {
      antiRaid: {
        enabled: true,
        userThreshold: 5,
        seconds: 20,
        action: 1,
        punishDuration: 0
      },
      antiSpam: {
        enabled: true,
        messageThreshold: 5,
        action: 0,
        muteTime: 5,
        roleId: null
      },
      antiAlt: {
        enabled: false,
        minAgeMinutes: 1440,
        action: 1,
        actionDurationMinutes: 0,
        roleId: null
      },
      antiMassMention: {
        enabled: false,
        mentionThreshold: 5,
        timeWindowSeconds: 60,
        maxMentionsInTimeWindow: 8,
        ignoreBots: true,
        action: 0,
        muteTime: 5,
        roleId: null
      }
    },
    xp: {
      textRate: 3,
      voiceRate: 2,
      levelChannelId: null,
      roleRewards: [],
      excludedChannels: []
    },
    starboard: {
      starboards: [{ channelId: null, threshold: 3, emoji: "⭐" }]
    },
    suggestions: {
      channelId: null,
      acceptChannelId: null,
      denyChannelId: null,
      considerChannelId: null,
      implementChannelId: null
    },
    moderation: {
      warnlogChannelId: null,
      miniWarnlogChannelId: null,
      warnExpireHours: 0
    },
    tickets: {
      panelChannelId: null,
      categoryId: null,
      supportRoles: [],
      buttonLabel: m.features.defaultTicketButtonLabel(),
      buttonEmoji: "🎫",
      panelTitle: m.features.defaultTicketPanelTitle(),
      panelDescription: m.features.defaultTicketPanelDescription(),
      maxActiveTickets: 1,
      autoCloseHours: 0
    },
    rolestates: {
      clearOnBan: false,
      ignoreBots: true
    },
    giveaways: {},
    confessions: {
      channelId: null,
      logChannelId: null
    },
    counting: {
      channelId: null
    },
    birthday: {
      channelId: null,
      roleId: null,
      message: { content: m.features.defaultBirthdayMessage() }
    },
    reputation: {
      cooldownMinutes: 60,
      dailyLimit: 5,
      notificationChannelId: null,
      enableNegative: false,
      enableAnonymous: false
    },
    roles: {
      staffRoleId: null,
      memberRoleId: null,
      selfAssignableRoles: []
    },
    statusroles: {
      status: "",
      addRoles: [],
      channelId: null
    },
    customvoice: {
      hubChannelId: null,
      categoryId: null,
      defaultNameFormat: m.features.defaultCustomVoiceNameFormat(),
      defaultUserLimit: 0,
      deleteWhenEmpty: true,
      emptyChannelTimeout: 1,
      allowNameCustomization: true,
      allowUserLimitCustomization: true,
      allowLocking: true
    },
    feeds: {
      entries: [{ url: "", channelId: null }]
    },
    streams: {
      entries: [{ url: "", channelId: null }],
      offlineNotifications: false
    },
    repeaters: {
      channelId: null,
      message: "",
      intervalMinutes: 60,
      noRedundant: true
    },
    votes: {
      channelId: null,
      message: m.features.defaultVoteMessage(),
      password: ""
    },
    statchannels: {
      categoryId: null,
      statTypes: [0, 1, 3]
    },
    invitetracking: {
      removeOnLeave: true,
      minAccountAgeDays: 0
    },
    afk: {
      afkType: 1,
      timeout: "0s",
      customMessage: "",
      disabledChannels: []
    }
  };
}

/**
 * Channel name fragments used to pre-select a likely channel when a feature is
 * first enabled. Keyed by feature id.
 */
export const wizardChannelPatterns: Record<string, string[]> = {
  multigreets: ["welcome", "greet", "general", "lobby"],
  rolegreets: ["welcome", "announcements", "roles"],
  logging: ["logs", "mod-log", "audit"],
  suggestions: ["suggest", "feedback", "ideas"],
  starboard: ["starboard", "best-of", "highlights"],
  giveaways: ["giveaway", "events", "contests"],
  confessions: ["confess", "anonymous", "secrets"],
  counting: ["count", "number", "game"],
  birthday: ["birthday", "bday", "celebration", "announcements"],
  moderation: ["mod-log", "modlog", "warn", "logs"],
  tickets: ["support", "help", "ticket"],
  reputation: ["general", "chat", "rep"],
  feeds: ["news", "feed", "updates", "announcements"],
  streams: ["stream", "live", "announcements"],
  repeaters: ["general", "chat", "rules"],
  votes: ["vote", "votes", "announcements"],
  statusroles: ["general", "announcements"]
};

/** Counters offered by the stat channel setup step. */
export const wizardStatChannelTypes = [
  { type: 0, get label() { return m.common.totalMembers(); }, get description() { return m.features.wizardStatType0Description(); } },
  { type: 1, get label() { return m.common.humans(); }, get description() { return m.features.wizardStatType1Description(); } },
  { type: 2, get label() { return m.common.bots(); }, get description() { return m.features.wizardStatType2Description(); } },
  { type: 3, get label() { return m.features.wizardStatType3Label(); }, get description() { return m.features.wizardStatType3Description(); } },
  { type: 5, get label() { return m.common.channels(); }, get description() { return m.features.wizardStatType5Description(); } },
  { type: 6, get label() { return m.common.roles(); }, get description() { return m.features.wizardStatType6Description(); } },
  { type: 7, get label() { return m.features.wizardStatType7Label(); }, get description() { return m.placeholders.serverBoostcount(); } }
];

/** Punishment options offered by the protection setup steps. */
export const wizardPunishmentActions = [
  { id: "0", get name() { return m.common.actionMute(); } },
  { id: "1", get name() { return m.common.actionKick(); } },
  { id: "2", get name() { return m.common.actionBan(); } },
  { id: "3", get name() { return m.features.wizardPun3(); } },
  { id: "5", get name() { return m.features.wizardPun5(); } },
  { id: "6", get name() { return m.features.wizardPun6(); } }
];

/**
 * How an AFK status is cleared.
 * Matches `Mewdeko.Modules.Afk.Afk.AfkTypeEnum`.
 */
export const wizardAfkTypes = [
  { id: "1", get name() { return m.features.wizardAfk1(); } },
  { id: "2", get name() { return m.features.wizardAfk2(); } },
  { id: "3", get name() { return m.features.wizardAfk3(); } },
  { id: "4", get name() { return m.features.wizardAfk4(); } }
];
