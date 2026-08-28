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
  difficulty: WizardDifficulty;
  setupTime: string;
  benefits: string[];
  steps: WizardFeatureStep[];
}

/** A named grouping of features shown as one collapsible section. */
export interface WizardFeatureCategory {
  name: string;
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
}

/**
 * Every log type the bot supports, grouped for the bulk logging configurator.
 * Ids must match `Mewdeko.Modules.Administration.Services.LogCommandService.LogType`.
 */
export const wizardLoggingEvents: WizardLoggingEvent[] = [
  {
    id: "UserJoined",
    name: "Member Joined",
    icon: "fa-utility-duo fa-regular fa-user-plus",
    description: "When someone joins the server",
    enabled: true,
    channelId: null,
    category: "Members"
  },
  {
    id: "UserLeft",
    name: "Member Left",
    icon: "fa-utility-duo fa-regular fa-user-minus",
    description: "When someone leaves the server",
    enabled: true,
    channelId: null,
    category: "Members"
  },
  {
    id: "MessageDeleted",
    name: "Message Deleted",
    icon: "fa-utility-duo fa-regular fa-trash",
    description: "When messages are deleted",
    enabled: true,
    channelId: null,
    category: "Messages"
  },
  {
    id: "MessagesBulkDeleted",
    name: "Messages Bulk Deleted",
    icon: "fa-utility-duo fa-regular fa-trash",
    description: "When many messages are purged at once",
    enabled: true,
    channelId: null,
    category: "Messages"
  },
  {
    id: "UserBanned",
    name: "Member Banned",
    icon: "fa-utility-duo fa-regular fa-shield-slash",
    description: "When someone is banned",
    enabled: true,
    channelId: null,
    category: "Moderation"
  },
  {
    id: "UserUnbanned",
    name: "Member Unbanned",
    icon: "fa-utility-duo fa-regular fa-circle-check",
    description: "When someone is unbanned",
    enabled: false,
    channelId: null,
    category: "Moderation"
  },
  {
    id: "UserMuted",
    name: "Member Muted",
    icon: "fa-utility-duo fa-regular fa-volume-slash",
    description: "When someone is muted or timed out",
    enabled: false,
    channelId: null,
    category: "Moderation"
  },
  {
    id: "UserRoleAdded",
    name: "Role Added",
    icon: "fa-utility-duo fa-regular fa-crown",
    description: "When a role is given to a member",
    enabled: false,
    channelId: null,
    category: "Members"
  },
  {
    id: "UserRoleRemoved",
    name: "Role Removed",
    icon: "fa-utility-duo fa-regular fa-crown",
    description: "When a role is taken from a member",
    enabled: false,
    channelId: null,
    category: "Members"
  },
  {
    id: "MessageUpdated",
    name: "Message Edited",
    icon: "fa-utility-duo fa-regular fa-pen-to-square",
    description: "When messages are edited",
    enabled: false,
    channelId: null,
    category: "Messages"
  },
  {
    id: "ReactionEvents",
    name: "Reactions",
    icon: "fa-utility-duo fa-regular fa-face-smile",
    description: "When reactions are added or removed",
    enabled: false,
    channelId: null,
    category: "Messages"
  },
  {
    id: "UsernameUpdated",
    name: "Username Changed",
    icon: "fa-utility-duo fa-regular fa-user",
    description: "When a member changes their username",
    enabled: false,
    channelId: null,
    category: "Profile"
  },
  {
    id: "NicknameUpdated",
    name: "Nickname Changed",
    icon: "fa-utility-duo fa-regular fa-id-card",
    description: "When a member changes their server nickname",
    enabled: false,
    channelId: null,
    category: "Profile"
  },
  {
    id: "AvatarUpdated",
    name: "Avatar Changed",
    icon: "fa-utility-duo fa-regular fa-image",
    description: "When a member changes their avatar",
    enabled: false,
    channelId: null,
    category: "Profile"
  },
  {
    id: "ChannelCreated",
    name: "Channel Created",
    icon: "fa-utility-duo fa-regular fa-circle-plus",
    description: "When channels are created",
    enabled: false,
    channelId: null,
    category: "Server"
  },
  {
    id: "ChannelDestroyed",
    name: "Channel Deleted",
    icon: "fa-utility-duo fa-regular fa-trash",
    description: "When channels are deleted",
    enabled: false,
    channelId: null,
    category: "Server"
  },
  {
    id: "ChannelUpdated",
    name: "Channel Updated",
    icon: "fa-utility-duo fa-regular fa-pen-to-square",
    description: "When channels are modified",
    enabled: false,
    channelId: null,
    category: "Server"
  },
  {
    id: "RoleCreated",
    name: "Role Created",
    icon: "fa-utility-duo fa-regular fa-crown",
    description: "When roles are created",
    enabled: false,
    channelId: null,
    category: "Server"
  },
  {
    id: "RoleDeleted",
    name: "Role Deleted",
    icon: "fa-utility-duo fa-regular fa-crown",
    description: "When roles are deleted",
    enabled: false,
    channelId: null,
    category: "Server"
  },
  {
    id: "RoleUpdated",
    name: "Role Updated",
    icon: "fa-utility-duo fa-regular fa-crown",
    description: "When roles are modified",
    enabled: false,
    channelId: null,
    category: "Server"
  },
  {
    id: "ThreadCreated",
    name: "Thread Created",
    icon: "fa-utility-duo fa-regular fa-comments",
    description: "When threads are created",
    enabled: false,
    channelId: null,
    category: "Server"
  },
  {
    id: "ThreadDeleted",
    name: "Thread Deleted",
    icon: "fa-utility-duo fa-regular fa-comments",
    description: "When threads are deleted",
    enabled: false,
    channelId: null,
    category: "Server"
  },
  {
    id: "ThreadUpdated",
    name: "Thread Updated",
    icon: "fa-utility-duo fa-regular fa-comments",
    description: "When threads are modified",
    enabled: false,
    channelId: null,
    category: "Server"
  },
  {
    id: "InviteCreated",
    name: "Invite Created",
    icon: "fa-utility-duo fa-regular fa-link",
    description: "When an invite link is created",
    enabled: false,
    channelId: null,
    category: "Server"
  },
  {
    id: "InviteDeleted",
    name: "Invite Deleted",
    icon: "fa-utility-duo fa-regular fa-chain",
    description: "When an invite link is revoked or expires",
    enabled: false,
    channelId: null,
    category: "Server"
  },
  {
    id: "VoicePresence",
    name: "Voice Activity",
    icon: "fa-utility-duo fa-regular fa-microphone",
    description: "When members join or leave voice channels",
    enabled: false,
    channelId: null,
    category: "Voice"
  },
  {
    id: "VoicePresenceTts",
    name: "Voice Activity (TTS)",
    icon: "fa-utility-duo fa-regular fa-volume",
    description: "Announces voice joins and leaves out loud",
    enabled: false,
    channelId: null,
    category: "Voice"
  },
  {
    id: "ServerUpdated",
    name: "Server Updated",
    icon: "fa-utility-duo fa-regular fa-gear",
    description: "When server settings change",
    enabled: false,
    channelId: null,
    category: "Server"
  },
  {
    id: "EventCreated",
    name: "Event Created",
    icon: "fa-utility-duo fa-regular fa-calendar",
    description: "When server events are created",
    enabled: false,
    channelId: null,
    category: "Server"
  },
  {
    id: "Other",
    name: "Other Events",
    icon: "fa-utility-duo fa-regular fa-circle-info",
    description: "Anything not covered by the categories above",
    enabled: false,
    channelId: null,
    category: "Server"
  }
];

/** The wizard's feature catalog, in the order the categories are shown. */
export const wizardFeatureCategories: WizardFeatureCategory[] = [
  {
    name: "Essential",
    description: "Core features every server should consider",
    features: [
      {
        id: "multigreets",
        title: "Welcome Messages",
        description: "Greet new members when they join/leave",
        icon: "fa-utility-duo fa-regular fa-bell",
        recommended: true,
        difficulty: "easy",
        setupTime: "3-5 min",
        benefits: [
          "Make new members feel welcome instantly",
          "Customize messages with embeds and buttons",
          "Set up multiple welcome channels",
          "Track member count in messages"
        ],
        steps: [
          {
            id: "channel",
            title: "Choose Channels",
            description: "Where should welcome messages be sent?",
            component: "channel"
          },
          {
            id: "message",
            title: "Design Message",
            description: "Create your welcome message",
            component: "message"
          }
        ]
      },
      {
        id: "protection",
        title: "Raid & Spam Protection",
        description: "Automatically stop raids, spam and alt accounts",
        icon: "fa-utility-duo fa-regular fa-shield-halved",
        recommended: true,
        difficulty: "medium",
        setupTime: "3-5 min",
        benefits: [
          "Catch join raids before they flood your server",
          "Auto-punish message spam and mention spam",
          "Block brand-new alt accounts",
          "Runs entirely on its own once configured"
        ],
        steps: [
          {
            id: "raid",
            title: "Raid & Spam",
            description: "Protect against join raids and message spam",
            component: "custom"
          },
          {
            id: "alts",
            title: "Alts & Mentions",
            description: "Screen new accounts and stop mass mentions",
            component: "custom"
          }
        ]
      },
      {
        id: "rolegreets",
        title: "Role Messages",
        description: "Greet members when they get roles (perfect for verification)",
        icon: "fa-utility-duo fa-regular fa-user",
        recommended: true,
        difficulty: "easy",
        setupTime: "2-4 min",
        benefits: [
          "Perfect for verification systems",
          "Celebrate staff promotions",
          "Reduce spam from unverified users",
          "Announce achievement roles"
        ],
        steps: [
          {
            id: "role",
            title: "Choose Role",
            description: "Which role should trigger the message?",
            component: "custom"
          },
          {
            id: "channel",
            title: "Choose Channel",
            description: "Where should the message be sent?",
            component: "channel"
          },
          {
            id: "message",
            title: "Design Message",
            description: "Create your role greet message",
            component: "message"
          }
        ]
      },
      {
        id: "logging",
        title: "Event Logging",
        description: "Track joins, leaves, and moderation actions",
        icon: "fa-utility-duo fa-regular fa-file",
        recommended: true,
        difficulty: "easy",
        setupTime: "2-3 min",
        benefits: [
          "Track all member activity",
          "Monitor message edits and deletions",
          "Log moderation actions",
          "Separate logs by event type"
        ],
        steps: [
          {
            id: "channels",
            title: "Configure Logging",
            description: "Set up event log channels",
            component: "custom"
          }
        ]
      },
      {
        id: "administration",
        title: "Auto-Assign Roles",
        description: "Give roles to new members automatically",
        icon: "fa-utility-duo fa-regular fa-cog",
        recommended: false,
        difficulty: "easy",
        setupTime: "2-3 min",
        benefits: [
          "Instant permissions for new members",
          "Distinguish members from bots",
          "Separate roles for users vs bots",
          "Grant channel access automatically"
        ],
        steps: [
          {
            id: "roles",
            title: "Choose Roles",
            description: "Select roles to auto-assign",
            component: "custom"
          }
        ]
      }
    ]
  },
  {
    name: "Moderation & Support",
    description: "Keep your server safe and organized",
    features: [
      {
        id: "moderation",
        title: "Moderation Tools",
        description: "Warning system for rule breakers",
        icon: "fa-utility-duo fa-regular fa-flag",
        recommended: false,
        difficulty: "medium",
        setupTime: "3-5 min",
        benefits: [
          "Track warnings per user",
          "Send warnings to a dedicated log channel",
          "Expire old warnings automatically",
          "Case management system"
        ],
        steps: [
          {
            id: "config",
            title: "Moderation Setup",
            description: "Configure warning logs and expiry",
            component: "custom"
          }
        ]
      },
      {
        id: "tickets",
        title: "Support Tickets",
        description: "Private support channels for members",
        icon: "fa-utility-duo fa-regular fa-ticket",
        recommended: false,
        difficulty: "medium",
        setupTime: "3-5 min",
        benefits: [
          "Private support channels",
          "A ready-to-use ticket panel with a button",
          "Support roles added automatically",
          "Transcript saving"
        ],
        steps: [
          {
            id: "panel",
            title: "Ticket Panel",
            description: "Create a panel members can open tickets from",
            component: "custom"
          }
        ]
      },
      {
        id: "rolestates",
        title: "Role Persistence",
        description: "Give members their roles back when they rejoin",
        icon: "fa-utility-duo fa-regular fa-clipboard-check",
        recommended: false,
        difficulty: "easy",
        setupTime: "1-2 min",
        benefits: [
          "Stops members leaving to shed a mute role",
          "Restores ranks and colours on rejoin",
          "Optionally clears saved roles on ban",
          "Works silently in the background"
        ],
        steps: [
          {
            id: "config",
            title: "Persistence Rules",
            description: "Choose how saved roles behave",
            component: "custom"
          }
        ]
      }
    ]
  },
  {
    name: "Community Growth",
    description: "Features to engage and grow your community",
    features: [
      {
        id: "xp",
        title: "XP & Leveling",
        description: "Reward active members with levels and role rewards",
        icon: "fa-utility-duo fa-regular fa-star",
        recommended: false,
        difficulty: "medium",
        setupTime: "5-8 min",
        benefits: [
          "Reward active members",
          "Automatic role rewards at levels",
          "Exclude spam channels",
          "Voice and text XP tracking"
        ],
        steps: [
          { id: "rates", title: "XP Rates", description: "Configure XP earning rates", component: "custom" },
          {
            id: "rewards",
            title: "Role Rewards",
            description: "Set up level-based role rewards",
            component: "custom"
          },
          {
            id: "exclusions",
            title: "Exclusions",
            description: "Exclude channels from XP gain",
            component: "custom"
          }
        ]
      },
      {
        id: "starboard",
        title: "Starboard",
        description: "Highlight the best messages with reactions",
        icon: "fa-utility-duo fa-regular fa-star",
        recommended: false,
        difficulty: "easy",
        setupTime: "2-3 min",
        benefits: [
          "Showcase community highlights",
          "Encourage positive interactions",
          "Custom star emoji and threshold",
          "Multiple starboards support"
        ],
        steps: [
          {
            id: "config",
            title: "Configure Starboard",
            description: "Set up your starboard",
            component: "custom"
          }
        ]
      },
      {
        id: "suggestions",
        title: "Suggestions",
        description: "Let members suggest server improvements",
        icon: "fa-utility-duo fa-regular fa-lightbulb",
        recommended: false,
        difficulty: "easy",
        setupTime: "2-4 min",
        benefits: [
          "Gather community feedback",
          "Automatic voting reactions",
          "Staff approval workflow",
          "Optional channels for accepted/denied"
        ],
        steps: [
          {
            id: "channels",
            title: "Suggestion Channels",
            description: "Configure where suggestions are managed",
            component: "custom"
          }
        ]
      },
      {
        id: "giveaways",
        title: "Giveaways",
        description: "Host contests and events (configured per giveaway)",
        icon: "fa-utility-duo fa-regular fa-gift",
        recommended: false,
        difficulty: "easy",
        setupTime: "N/A",
        benefits: [
          "Host engaging events",
          "Automatic winner selection",
          "Role and message requirements",
          "Multiple winners support",
          "Configured per-giveaway in dashboard"
        ],
        steps: []
      },
      {
        id: "confessions",
        title: "Anonymous Confessions",
        description: "Let members submit anonymous confessions",
        icon: "fa-utility-duo fa-regular fa-comment",
        recommended: false,
        difficulty: "easy",
        setupTime: "2-3 min",
        benefits: [
          "Anonymous community feedback",
          "Staff moderation via log channel",
          "Build trust and openness",
          "Track confession statistics"
        ],
        steps: [
          {
            id: "config",
            title: "Confession Setup",
            description: "Configure confession channels",
            component: "custom"
          }
        ]
      },
      {
        id: "counting",
        title: "Counting Game",
        description: "Count to infinity (or chaos ensues)",
        icon: "fa-utility-duo fa-regular fa-list-numeric",
        recommended: false,
        difficulty: "easy",
        setupTime: "1 min",
        benefits: [
          "Fun community activity",
          "Simple but engaging",
          "Automatic number tracking",
          "Prevents duplicate counts"
        ],
        steps: [
          {
            id: "channel",
            title: "Counting Channel",
            description: "Where should counting happen?",
            component: "channel"
          }
        ]
      },
      {
        id: "birthday",
        title: "Birthday Celebrations",
        description: "Celebrate member birthdays automatically",
        icon: "fa-utility-duo fa-regular fa-birthday-cake",
        recommended: false,
        difficulty: "easy",
        setupTime: "3-4 min",
        benefits: [
          "Auto birthday announcements",
          "Optional birthday role",
          "Customizable messages/embeds",
          "Never miss a birthday"
        ],
        steps: [
          {
            id: "channel",
            title: "Birthday Channel & Role",
            description: "Where to announce birthdays",
            component: "custom"
          },
          {
            id: "message",
            title: "Birthday Message",
            description: "Customize the birthday announcement",
            component: "message"
          }
        ]
      },
      {
        id: "reputation",
        title: "Reputation",
        description: "Let members thank each other and earn standing",
        icon: "fa-utility-duo fa-regular fa-thumbs-up",
        recommended: false,
        difficulty: "easy",
        setupTime: "2-3 min",
        benefits: [
          "Recognise genuinely helpful members",
          "Cooldowns and daily limits stop farming",
          "Optional announcement channel",
          "Leaderboard and role rewards"
        ],
        steps: [
          {
            id: "config",
            title: "Reputation Rules",
            description: "Set cooldowns, limits and announcements",
            component: "custom"
          }
        ]
      }
    ]
  },
  {
    name: "Roles & Access",
    description: "Control who gets what in your server",
    features: [
      {
        id: "roles",
        title: "Server Roles",
        description: "Set staff and member roles, plus self-assignable roles",
        icon: "fa-utility-duo fa-regular fa-crown",
        recommended: true,
        difficulty: "easy",
        setupTime: "2-4 min",
        benefits: [
          "Tell the bot which role is your staff role",
          "Let members pick their own roles",
          "Powers permission checks across features",
          "No commands needed to hand out cosmetic roles"
        ],
        steps: [
          {
            id: "core",
            title: "Staff & Member Roles",
            description: "Which roles identify your staff and members?",
            component: "custom"
          },
          {
            id: "selfassign",
            title: "Self-Assignable Roles",
            description: "Roles members can give themselves",
            component: "custom"
          }
        ]
      },
      {
        id: "statusroles",
        title: "Status Roles",
        description: "Give a role to members who put text in their status",
        icon: "fa-utility-duo fa-regular fa-circle-user",
        recommended: false,
        difficulty: "easy",
        setupTime: "2 min",
        benefits: [
          "Reward members who advertise your server",
          "Automatic add and remove as the status changes",
          "Great for /vanity or invite links",
          "Optional announcement message"
        ],
        steps: [
          {
            id: "config",
            title: "Status & Roles",
            description: "Pick the status text and the roles to grant",
            component: "custom"
          }
        ]
      },
      {
        id: "customvoice",
        title: "Custom Voice Channels",
        description: "Members create their own voice channels on demand",
        icon: "fa-utility-duo fa-regular fa-microphone",
        recommended: false,
        difficulty: "medium",
        setupTime: "3-4 min",
        benefits: [
          "One hub channel spawns personal voice rooms",
          "Owners can rename, lock and limit their room",
          "Empty channels clean themselves up",
          "No more dozens of unused voice channels"
        ],
        steps: [
          {
            id: "hub",
            title: "Hub & Category",
            description: "Where should personal channels be created?",
            component: "custom"
          }
        ]
      }
    ]
  },
  {
    name: "Notifications & Content",
    description: "Bring outside content into your server",
    features: [
      {
        id: "feeds",
        title: "RSS Feeds",
        description: "Post new articles from any RSS feed",
        icon: "fa-utility-duo fa-regular fa-newspaper",
        recommended: false,
        difficulty: "easy",
        setupTime: "2-3 min",
        benefits: [
          "Follow blogs, news sites and release notes",
          "Each feed posts to the channel you choose",
          "Automatic polling, no commands needed",
          "Custom message per feed"
        ],
        steps: [
          {
            id: "feeds",
            title: "Add Feeds",
            description: "Which feeds should post, and where?",
            component: "custom"
          }
        ]
      },
      {
        id: "streams",
        title: "Stream Notifications",
        description: "Announce when your streamers go live",
        icon: "fa-utility-duo fa-regular fa-video",
        recommended: false,
        difficulty: "easy",
        setupTime: "2-3 min",
        benefits: [
          "Twitch, YouTube, Trovo and Picarto support",
          "Announce the moment a stream starts",
          "Optional offline notifications",
          "Custom announcement message"
        ],
        steps: [
          {
            id: "streams",
            title: "Follow Streamers",
            description: "Which streams should be announced, and where?",
            component: "custom"
          }
        ]
      },
      {
        id: "repeaters",
        title: "Repeating Messages",
        description: "Post a recurring or sticky message in a channel",
        icon: "fa-utility-duo fa-regular fa-arrows-rotate",
        recommended: false,
        difficulty: "easy",
        setupTime: "2-3 min",
        benefits: [
          "Keep rules or links visible in busy channels",
          "Sticky mode reposts after conversation",
          "Choose any interval you like",
          "Skips reposting when nothing has changed"
        ],
        steps: [
          {
            id: "config",
            title: "Message & Interval",
            description: "What should repeat, where, and how often?",
            component: "custom"
          }
        ]
      },
      {
        id: "votes",
        title: "Vote Rewards",
        description: "Reward members for voting for your server",
        icon: "fa-utility-duo fa-regular fa-heart",
        recommended: false,
        difficulty: "medium",
        setupTime: "2-4 min",
        benefits: [
          "Thank voters automatically",
          "Optional temporary reward roles",
          "Announcement channel for every vote",
          "Works with top.gg webhooks"
        ],
        steps: [
          {
            id: "config",
            title: "Vote Setup",
            description: "Announcement channel, message and webhook password",
            component: "custom"
          }
        ]
      }
    ]
  },
  {
    name: "Server Insights",
    description: "Surface what's happening in your server",
    features: [
      {
        id: "statchannels",
        title: "Stat Channels",
        description: "Live member and server counts in your channel list",
        icon: "fa-utility-duo fa-regular fa-chart-simple",
        recommended: false,
        difficulty: "easy",
        setupTime: "2 min",
        benefits: [
          "Member, human, bot and boost counters",
          "Channels are created for you",
          "Updates automatically as numbers change",
          "Fully customisable templates later"
        ],
        steps: [
          {
            id: "stats",
            title: "Choose Counters",
            description: "Which counters should be created?",
            component: "custom"
          }
        ]
      },
      {
        id: "invitetracking",
        title: "Invite Tracking",
        description: "See who invited each new member",
        icon: "fa-utility-duo fa-regular fa-link",
        recommended: false,
        difficulty: "easy",
        setupTime: "1-2 min",
        benefits: [
          "Attribute every join to an inviter",
          "Invite leaderboard for your community",
          "Use %inviter% placeholders in greets",
          "Optional minimum account age"
        ],
        steps: [
          {
            id: "config",
            title: "Tracking Rules",
            description: "How should invites be counted?",
            component: "custom"
          }
        ]
      },
      {
        id: "afk",
        title: "AFK System",
        description: "Let members mark themselves away",
        icon: "fa-utility-duo fa-regular fa-moon",
        recommended: false,
        difficulty: "easy",
        setupTime: "1-2 min",
        benefits: [
          "Tells people why someone isn't replying",
          "Auto-clears when the member speaks",
          "Disable it in channels where it's noise",
          "Custom AFK response message"
        ],
        steps: [
          {
            id: "config",
            title: "AFK Behaviour",
            description: "How should AFK messages work?",
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

/** Every feature starts skipped until the user opts in. */
export function createDefaultFeatureStates(): Record<string, WizardFeatureState> {
  return Object.fromEntries(allWizardFeatures.map((feature) => [feature.id, "skip"]));
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
      message: { content: "Welcome to %server.name%, %user.mention%! 🎉" },
      applyToMultiple: false
    },
    rolegreets: {
      roleId: null,
      channelId: null,
      message: { content: "Congratulations %user.mention% on getting the %role.name% role! 🎉" }
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
      buttonLabel: "Create Ticket",
      panelTitle: "Need help?",
      panelDescription: "Click the button below to open a private support ticket."
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
      message: { content: "Happy Birthday, %user.mention%! 🎉🎂" }
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
      defaultNameFormat: "%username%'s Channel",
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
      message: "Thanks for voting, %user.mention%!",
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
  { type: 0, label: "Total Members", description: "Everyone in the server" },
  { type: 1, label: "Humans", description: "Members excluding bots" },
  { type: 2, label: "Bots", description: "Bot accounts only" },
  { type: 3, label: "Online Members", description: "Members currently online" },
  { type: 5, label: "Channels", description: "Total channel count" },
  { type: 6, label: "Roles", description: "Total role count" },
  { type: 7, label: "Boosts", description: "Server boost count" }
];

/** Punishment options offered by the protection setup steps. */
export const wizardPunishmentActions = [
  { id: "0", name: "Mute" },
  { id: "1", name: "Kick" },
  { id: "2", name: "Ban" },
  { id: "3", name: "Softban" },
  { id: "5", name: "Chat mute" },
  { id: "6", name: "Voice mute" }
];

/**
 * How an AFK status is cleared.
 * Matches `Mewdeko.Modules.Afk.Afk.AfkTypeEnum`.
 */
export const wizardAfkTypes = [
  { id: "1", name: "Self Disable" },
  { id: "2", name: "On Message" },
  { id: "3", name: "On Type" },
  { id: "4", name: "Either" }
];
