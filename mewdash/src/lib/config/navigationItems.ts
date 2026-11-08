// Shared navigation items for both mobile and desktop navigation
import { m } from "$lib/i18n";

export interface NavigationItem {
  /** Localized display name accessor; call it at render time (`item.label()`). */
  label: () => string;
  icon: string;
  href: string;
  /** Grouping used by the Dashboard Access page and matched on by search. */
  category: string;
  /** Localized display label for {@link category}. `category` stays the literal matching key. */
  categoryLabel: () => string;
  /**
   * Bot owner tools. These live under /owner rather than /dashboard, and the sidebar shows a
   * single Owner Panel link instead of listing them.
   */
  ownerOnly?: boolean;
  description?: () => string;
  /**
   * Extra terms the command palette matches on, for words users search that do not
   * appear in the label or description ("autoresponder" for Triggers).
   */
  keywords?: string[];
}

/**
 * Every dashboard feature. The sidebar sorts these by label, so the order here does not matter
 * and a new feature can go anywhere in the list.
 *
 * `category` no longer groups the sidebar. It is still what the Dashboard Access page groups its
 * permission sections by, and it is a field the command palette matches on, so "moderation" finds
 * things filed under Security.
 */
/**
 * The translated name of a feature category. `category` values stay English keys because search
 * and the Dashboard Access page group and filter by them; this is what gets shown for one.
 */
export function categoryLabel(category: string): string {
  switch (category) {
    case "Community": return m.features.categoryCommunity();
    case "Entertainment": return m.features.categoryEntertainment();
    case "Actions": return m.features.categoryActions();
    case "Security": return m.features.categorySecurity();
    case "Settings": return m.features.categorySettings();
    case "Analytics": return m.features.analyticsName();
    default: return category;
  }
}

export const allDashboardFeatures: NavigationItem[] = [
  {
    label: m.features.administrationName,
    icon: "fa-utility-duo fa-regular fa-cog",
    href: "/dashboard/administration",
    category: "Security",
    categoryLabel: m.features.categorySecurity,
    description: m.features.administrationDescription,
    keywords: ["admin", "administration", "server tools", "backup", "restore", "template", "lockdown", "slowmode", "purge", "roles"],
  },
  {
    label: m.features.afkName,
    icon: "fa-utility-duo fa-regular fa-moon",
    href: "/dashboard/afk",
    category: "Actions",
    categoryLabel: m.features.categoryActions,
    description: m.features.afkDescription,
    keywords: ["afk", "afk system", "away", "status", "idle"],
  },
  {
    label: m.features.auditlogName,
    icon: "fa-utility-duo fa-regular fa-clipboard-check",
    href: "/dashboard/auditlog",
    category: "Security",
    categoryLabel: m.features.categorySecurity,
    description: m.features.auditlogDescription,
    keywords: ["audit", "audit log", "history", "who changed", "accountability", "dashboard access log"],
  },
  {
    label: m.features.channelAccessName,
    icon: "fa-utility-duo fa-regular fa-lock",
    href: "/dashboard/channel-access",
    category: "Security",
    categoryLabel: m.features.categorySecurity,
    description: m.features.channelAccessDescription,
    keywords: ["channel access", "applications", "apply", "vote", "locked", "gate", "private"],
  },
  {
    label: m.features.birthdayName,
    icon: "fa-utility-duo fa-regular fa-birthday-cake",
    href: "/dashboard/birthday",
    category: "Community",
    categoryLabel: m.features.categoryCommunity,
    description: m.features.birthdayDescription,
    keywords: ["birthday", "birthdays", "celebrate", "anniversary"],
  },
  {
    label: m.features.wordofthedayName,
    icon: "fa-utility-duo fa-regular fa-book-open",
    href: "/dashboard/wordoftheday",
    category: "Community",
    categoryLabel: m.features.categoryCommunity,
    description: m.features.wordofthedayDescription,
    keywords: ["word of the day", "wotd", "vocabulary", "dictionary", "definition", "daily word", "datamuse"],
  },
  {
    label: m.features.chatsaverName,
    icon: "fa-utility-duo fa-regular fa-folder",
    href: "/dashboard/chatsaver",
    category: "Security",
    categoryLabel: m.features.categorySecurity,
    description: m.features.chatsaverDescription,
    keywords: ["chat saver", "audit", "history", "messages"],
  },
  {
    label: m.features.accessName,
    icon: "fa-utility-duo fa-regular fa-key",
    href: "/dashboard/access",
    category: "Security",
    categoryLabel: m.features.categorySecurity,
    description: m.features.accessDescription,
    keywords: ["dashboard access", "permissions", "grant", "staff", "restrict", "who can edit"],
  },
  {
    label: m.features.confessionsName,
    icon: "fa-utility-duo fa-regular fa-comment",
    href: "/dashboard/confessions",
    category: "Community",
    categoryLabel: m.features.categoryCommunity,
    description: m.features.confessionsDescription,
    keywords: ["confessions", "anonymous", "secrets"],
  },
  {
    label: m.features.countingName,
    icon: "fa-utility-duo fa-regular fa-list-numeric",
    href: "/dashboard/counting",
    category: "Community",
    categoryLabel: m.features.categoryCommunity,
    description: m.features.countingDescription,
    keywords: ["counting", "numbers", "game", "channel"],
  },
  {
    label: m.features.currencyName,
    icon: "fa-utility-duo fa-regular fa-money-bill",
    href: "/dashboard/currency",
    category: "Entertainment",
    categoryLabel: m.features.categoryEntertainment,
    description: m.features.currencyDescription,
    keywords: ["currency", "economy", "balance", "money", "shop", "balance", "coins", "payout", "gambling"],
  },
  {
    label: m.features.minecraftName,
    icon: "fa-utility-duo fa-regular fa-server",
    href: "/dashboard/minecraft",
    category: "Entertainment",
    categoryLabel: m.features.categoryEntertainment,
    description: m.features.minecraftDescription,
    keywords: ["minecraft", "server status", "mc", "bridge", "monitoring"],
  },
  {
    label: m.features.statchannelsName,
    icon: "fa-utility-duo fa-regular fa-chart-simple",
    href: "/dashboard/statchannels",
    category: "Community",
    categoryLabel: m.features.categoryCommunity,
    description: m.features.statchannelsDescription,
    keywords: ["stat channels", "counter", "member count", "live stats", "voice channel stats"],
  },
  {
    label: m.features.customvoiceName,
    icon: "fa-utility-duo fa-regular fa-microphone",
    href: "/dashboard/customvoice",
    category: "Entertainment",
    categoryLabel: m.features.categoryEntertainment,
    description: m.features.customvoiceDescription,
    keywords: ["voice", "channels", "temporary", "custom"],
  },
  {
    label: m.features.embedbuilderName,
    icon: "fa-utility-duo fa-regular fa-link",
    href: "/dashboard/embedbuilder",
    category: "Actions",
    categoryLabel: m.features.categoryActions,
    description: m.features.embedbuilderDescription,
    keywords: ["embeds", "builder", "custom", "messages"],
  },
  {
    label: m.common.alerts,
    icon: "fa-utility-duo fa-regular fa-bell",
    href: "/dashboard/alerts",
    category: "Community",
    categoryLabel: m.features.categoryCommunity,
    description: m.features.alertsDescription,
    keywords: [
      "alerts", "feeds", "rss", "news", "updates", "streams", "twitch", "youtube", "kick", "notifications",
      "go live", "free games", "epic", "steam", "gog", "chat bot", "streamer",
    ],
  },
  {
    label: m.features.automationsName,
    icon: "fa-utility-duo fa-regular fa-wand-magic",
    href: "/dashboard/automations",
    category: "Actions",
    categoryLabel: m.features.categoryActions,
    description: m.features.automationsDescription,
    keywords: ["automations", "automation", "triggers", "actions", "rules", "workflows", "no code", "when", "then", "templates"],
  },
  {
    label: m.features.formsName,
    icon: "fa-utility-duo fa-regular fa-clipboard",
    href: "/dashboard/forms",
    category: "Community",
    categoryLabel: m.features.categoryCommunity,
    description: m.features.formsDescription,
    keywords: ["forms", "surveys", "questionnaire", "applications", "responses"],
  },
  {
    label: m.features.giveawaysName,
    icon: "fa-utility-duo fa-regular fa-gift",
    href: "/dashboard/giveaways",
    category: "Entertainment",
    categoryLabel: m.features.categoryEntertainment,
    description: m.features.giveawaysDescription,
    keywords: ["giveaways", "contests", "prizes", "events"],
  },
  {
    label: m.features.multigreetsName,
    icon: "fa-utility-duo fa-regular fa-bell",
    href: "/dashboard/multigreets",
    category: "Actions",
    categoryLabel: m.features.categoryActions,
    description: m.features.multigreetsDescription,
    keywords: ["greets", "multigreets", "multi greets", "welcome", "goodbye", "messages", "join message", "leave message"],
  },
  {
    label: m.features.highlightsName,
    icon: "fa-utility-duo fa-regular fa-bolt",
    href: "/dashboard/highlights",
    category: "Community",
    categoryLabel: m.features.categoryCommunity,
    description: m.features.highlightsDescription,
    keywords: ["highlights", "keywords", "notifications", "mentions"],
  },
  {
    label: m.features.invitesName,
    icon: "fa-utility-duo fa-regular fa-users",
    href: "/dashboard/invites",
    category: "Community",
    categoryLabel: m.features.categoryCommunity,
    description: m.features.invitesDescription,
    keywords: ["invites", "tracking", "referrals", "recruitment", "invite tracker", "fake invites", "bonus invites", "retention", "vanity", "labels", "who invited"],
  },
  {
    label: m.features.serverstatsName,
    icon: "fa-utility-duo fa-regular fa-chart-simple",
    href: "/dashboard/serverstats",
    category: "Analytics",
    categoryLabel: m.features.analyticsName,
    description: m.features.serverstatsDescription,
    keywords: ["activity", "stats", "statbot", "voice", "games", "presence", "lookback", "top", "chart", "charts", "privacy", "snapshots", "growth"],
  },
  {
    label: m.features.linkfixName,
    icon: "fa-utility-duo fa-regular fa-link",
    href: "/dashboard/linkfix",
    category: "Community",
    categoryLabel: m.features.categoryCommunity,
    description: m.features.linkfixDescription,
    keywords: ["link fix", "fix links", "embed fix", "fxtwitter", "vxtwitter", "twitter", "instagram", "tiktok", "reddit", "pinterest", "bluesky", "pixiv", "embeds"],
  },
  {
    label: m.features.bridgesName,
    icon: "fa-utility-duo fa-regular fa-link-simple",
    href: "/dashboard/bridges",
    category: "Community",
    categoryLabel: m.features.categoryCommunity,
    description: m.features.bridgesDescription,
    keywords: ["bridge", "bridges", "fluxer", "cross platform", "relay", "link channel", "connect channel", "mirror"],
  },
  {
    label: m.features.liveboardsName,
    icon: "fa-utility-duo fa-regular fa-thumbtack",
    href: "/dashboard/liveboards",
    category: "Community",
    categoryLabel: m.features.categoryCommunity,
    description: m.features.liveboardsDescription,
    keywords: ["live boards", "pinned leaderboard", "pin leaderboard", "auto update", "server report", "weekly report", "monthly report", "digest"],
  },
  {
    label: m.features.loggingName,
    icon: "fa-utility-duo fa-regular fa-file",
    href: "/dashboard/logging",
    category: "Security",
    categoryLabel: m.features.categorySecurity,
    description: m.features.loggingDescription,
    keywords: ["logging", "events", "audit", "history"],
  },
  {
    label: m.features.messagestatsName,
    icon: "fa-utility-duo fa-regular fa-envelope",
    href: "/dashboard/messagestats",
    category: "Analytics",
    categoryLabel: m.features.analyticsName,
    description: m.features.messagestatsDescription,
    keywords: ["message stats", "activity", "tracking", "analytics"],
  },
  {
    label: m.automod.title,
    icon: "fa-utility-duo fa-regular fa-shield-halved",
    href: "/dashboard/automod",
    category: "Security",
    categoryLabel: m.features.categorySecurity,
    description: m.automod.subtitle,
    keywords: [
      "automod",
      "auto moderation",
      "protection",
      "anti raid",
      "anti spam",
      "anti alt",
      "filter",
      "word filter",
      "invite filter",
      "link filter",
      "auto ban",
      "blacklist",
      "discord automod"
    ],
  },
  {
    label: m.features.pollsName,
    icon: "fa-utility-duo fa-regular fa-chart-simple",
    href: "/dashboard/polls",
    category: "Community",
    categoryLabel: m.features.categoryCommunity,
    description: m.features.pollsDescription,
    keywords: ["poll", "vote", "survey", "question", "schedule"],
  },
  {
    label: m.features.utilityName,
    icon: "fa-utility-duo fa-regular fa-wrench",
    href: "/dashboard/utility",
    category: "Actions",
    categoryLabel: m.features.categoryActions,
    description: m.features.utilityDescription,
    keywords: ["alias", "quote", "autopublish", "publish", "stream role", "ai", "chatbot", "nsfw", "role monitor"],
  },
  {
    label: m.features.categoryModeration,
    icon: "fa-utility-duo fa-regular fa-flag",
    href: "/dashboard/moderation",
    category: "Security",
    categoryLabel: m.features.categorySecurity,
    description: m.features.moderationDescription,
    keywords: ["moderation", "warnings", "punishments", "discipline"],
  },
  {
    label: m.features.musicName,
    icon: "fa-utility-duo fa-regular fa-music",
    href: "/dashboard/music",
    category: "Entertainment",
    categoryLabel: m.features.categoryEntertainment,
    description: m.features.musicDescription,
    keywords: ["music", "player", "songs", "queue", "audio"],
  },
  {
    label: m.features.patreonName,
    icon: "fa-utility-duo fa-regular fa-heart",
    href: "/dashboard/patreon",
    category: "Community",
    categoryLabel: m.features.categoryCommunity,
    description: m.features.patreonDescription,
    keywords: ["patreon", "supporters", "donations", "premium"],
  },
  {
    label: m.features.featureRequestsName,
    icon: "fa-utility-duo fa-regular fa-lightbulb",
    href: "/dashboard/feature-requests",
    category: "Community",
    categoryLabel: m.features.categoryCommunity,
    description: m.features.featureRequestsDescription,
    keywords: ["feature request", "suggest", "suggestion", "idea", "bug report", "feedback", "roadmap", "upvote"],
  },
  {
    label: m.features.channelMessagesName,
    icon: "fa-utility-duo fa-regular fa-sync",
    href: "/dashboard/channel-messages",
    category: "Actions",
    categoryLabel: m.features.categoryActions,
    description: m.features.channelMessagesDescription,
    keywords: [
      "channel messages",
      "repeaters",
      "repeater",
      "recurring",
      "scheduled",
      "messages",
      "sticky",
      "stickies",
      "pinned",
      "auto reactions",
      "auto react",
      "reactions",
    ],
  },
  {
    label: m.features.achievementsName,
    icon: "fa-utility-duo fa-regular fa-crown",
    href: "/dashboard/achievements",
    category: "Community",
    categoryLabel: m.features.categoryCommunity,
    description: m.features.achievementsDescription,
    keywords: ["achievements", "badges", "milestones", "ranks", "tiers", "prestige", "trophies", "unlocks", "goals", "profile card"],
  },
  {
    label: m.features.reputationName,
    icon: "fa-utility-duo fa-regular fa-trophy",
    href: "/dashboard/reputation",
    category: "Community",
    categoryLabel: m.features.categoryCommunity,
    description: m.features.reputationDescription,
    keywords: ["reputation", "rep", "rewards", "karma"],
  },
  {
    label: m.features.rolesName,
    icon: "fa-utility-duo fa-regular fa-tag",
    href: "/dashboard/roles",
    category: "Actions",
    categoryLabel: m.features.categoryActions,
    description: m.features.rolesDescription,
    keywords: [
      "roles", "role menus", "self roles", "self assign", "pick roles", "dropdown", "buttons", "pronouns", "color roles", "reaction roles",
      "role states", "sticky roles", "persistence", "restore",
      "status roles", "custom status",
      "stat roles", "statroles", "activity roles", "active member", "inactive", "top chatter", "voice role", "invite rewards", "message rewards", "streak",
      "role greets", "role messages", "welcome",
      "join timeout", "join role timeout", "time roles", "timed roles", "kick unverified"
    ],
  },
  {
    label: m.features.settingsName,
    icon: "fa-utility-duo fa-regular fa-cog",
    href: "/dashboard/settings",
    category: "Settings",
    categoryLabel: m.features.categorySettings,
    description: m.features.settingsDescription,
    keywords: ["settings", "config", "general", "bot", "prefix"],
  },
  {
    label: m.features.starboardName,
    icon: "fa-utility-duo fa-regular fa-star",
    href: "/dashboard/starboard",
    category: "Community",
    categoryLabel: m.features.categoryCommunity,
    description: m.features.starboardDescription,
    keywords: ["starboard", "stars", "popular", "messages", "highlights"],
  },
  {
    label: m.features.suggestionsName,
    icon: "fa-utility-duo fa-regular fa-lightbulb",
    href: "/dashboard/suggestions",
    category: "Community",
    categoryLabel: m.features.categoryCommunity,
    description: m.features.suggestionsDescription,
    keywords: ["suggestions", "voting", "ideas", "feedback"],
  },
  {
    label: m.features.ticketsName,
    icon: "fa-utility-duo fa-regular fa-ticket",
    href: "/dashboard/tickets",
    category: "Community",
    categoryLabel: m.features.categoryCommunity,
    description: m.features.ticketsDescription,
    keywords: ["tickets", "support", "help", "assistance", "panels"],
  },
  {
    label: m.features.todoName,
    icon: "fa-utility-duo fa-regular fa-check",
    href: "/dashboard/todo",
    category: "Community",
    categoryLabel: m.features.categoryCommunity,
    description: m.features.todoDescription,
    keywords: ["todo", "tasks", "lists", "management"],
  },
  {
    label: m.features.chatTriggersName,
    icon: "fa-utility-duo fa-regular fa-comments",
    href: "/dashboard/chat-triggers",
    category: "Actions",
    categoryLabel: m.features.categoryActions,
    description: m.features.chatTriggersDescription,
    keywords: ["triggers", "chat triggers", "custom commands", "autoresponder", "reactions", "chat"],
  },
  {
    label: m.features.votesName,
    icon: "fa-utility-duo fa-regular fa-thumbs-up",
    href: "/dashboard/votes",
    category: "Community",
    categoryLabel: m.features.categoryCommunity,
    description: m.features.votesDescription,
    keywords: ["votes", "voting", "rewards", "incentives"],
  },
  {
    label: m.features.xpName,
    icon: "fa-utility-duo fa-regular fa-star",
    href: "/dashboard/xp",
    category: "Community",
    categoryLabel: m.features.categoryCommunity,
    description: m.features.xpDescription,
    keywords: ["xp", "experience", "levels", "leveling", "ranking", "leaderboard"],
  },
  {
    label: m.features.importName,
    icon: "fa-utility-duo fa-regular fa-arrow-right-to-bracket",
    href: "/dashboard/import",
    category: "Community",
    categoryLabel: m.features.categoryCommunity,
    description: m.features.importDescription,
    keywords: ["import", "mee6", "lurkr", "polaris", "arcane", "amari", "tatsu", "unbelievaboat", "migrate", "transfer"],
  },
];

// Group features by category
export function getFeaturesByCategory(isOwner: boolean = false) {
  const filtered = allDashboardFeatures.filter(
    (item) => !item.ownerOnly || isOwner,
  );

  const grouped = filtered.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, NavigationItem[]>,
  );

  return grouped;
}

// Category order for consistent display
export const categoryOrder = [
  "Community",
  "Entertainment",
  "Actions",
  "Security",
  "Analytics",
  "Settings",
];

/**
 * Bot owner tools, which live under /owner with their own sidebar rather than being mixed into the
 * per-server feature list. Every entry is owner only; the flag is set once below so search and the
 * access page keep treating them that way.
 */
export const ownerFeatures: NavigationItem[] = [
  {
    label: m.features.dockerName,
    icon: "fa-utility-duo fa-regular fa-box",
    href: "/owner/docker",
    category: "Analytics",
    categoryLabel: m.features.analyticsName,
    description: m.features.dockerDescription,
    keywords: ["docker", "containers", "compose", "images", "restart", "stop", "start", "selfhost", "fleet"],
  },
  {
    label: m.customBot.ownerName,
    icon: "fa-utility-duo fa-regular fa-wand-magic-sparkles",
    href: "/owner/custom-bots",
    category: "Analytics",
    categoryLabel: m.features.analyticsName,
    description: m.customBot.ownerDescription,
    keywords: ["custom bot", "slots", "ko-fi", "grant", "paid", "hosting", "white label"],
  },
  {
    label: m.features.botHellsName,
    icon: "fa-utility-duo fa-regular fa-microchip",
    href: "/owner/bot-hells",
    category: "Analytics",
    categoryLabel: m.features.analyticsName,
    description: m.features.botHellsDescription,
    keywords: ["bot hell", "bot farm", "bots", "bot ratio", "leave", "bulk leave", "spam servers"],
  },
  {
    label: m.features.leaveFeedbackName,
    icon: "fa-utility-duo fa-regular fa-comments",
    href: "/owner/leave-feedback",
    category: "Analytics",
    categoryLabel: m.features.analyticsName,
    description: m.features.leaveFeedbackDescription,
    keywords: ["leave feedback", "kick feedback", "why removed", "churn", "exit survey"],
  },
  {
    label: m.features.analyticsName,
    icon: "fa-utility-duo fa-regular fa-chart-simple",
    href: "/owner/analytics",
    category: "Analytics",
    categoryLabel: m.features.analyticsName,
    description: m.features.analyticsDescription,
    keywords: ["analytics", "telemetry", "metrics", "commands", "events", "errors", "growth", "alerts", "shards", "latency"],
  },
  {
    label: m.features.performanceName,
    icon: "fa-utility-duo fa-regular fa-clock",
    href: "/owner/performance",
    category: "Analytics",
    categoryLabel: m.features.analyticsName,
    description: m.features.performanceDescription,
    keywords: ["performance", "metrics", "cpu", "memory", "latency", "monitoring"],
  },
  {
    label: m.features.processLogsName,
    icon: "fa-utility-duo fa-regular fa-rectangle-code",
    href: "/owner/process-logs",
    category: "Analytics",
    categoryLabel: m.features.analyticsName,
    description: m.features.processLogsDescription,
    keywords: ["pm2", "logs", "console", "stdout", "stderr", "tail", "process", "crash", "stack trace"],
  },
].map(item => ({ ...item, ownerOnly: true }));

/**
 * Both lists together, for lookups by href that do not care which area a page lives in.
 */
export const allFeatures: NavigationItem[] = [...allDashboardFeatures, ...ownerFeatures];

/**
 * A task group in the sidebar and the dashboard home tabs.
 */
export interface NavigationGroup {
  id: string;
  label: () => string;
  /** Dashboard hrefs in display order. */
  hrefs: string[];
}

/**
 * Every dashboard page filed under the task it belongs to, in display order.
 */
export const navigationGroups: NavigationGroup[] = [
  {
    id: "essentials",
    label: m.features.groupEssentials,
    hrefs: [
      "/dashboard/multigreets",
      "/dashboard/roles",
      "/dashboard/moderation",
      "/dashboard/automod",
      "/dashboard/logging",
      "/dashboard/xp",
      "/dashboard/achievements",
      "/dashboard/starboard",
    ],
  },
  {
    id: "management",
    label: m.features.groupManagement,
    hrefs: [
      "/dashboard/chat-triggers",
      "/dashboard/automations",
      "/dashboard/tickets",
      "/dashboard/forms",
      "/dashboard/invites",
      "/dashboard/channel-access",
      "/dashboard/bridges",
      "/dashboard/administration",
      "/dashboard/access",
    ],
  },
  {
    id: "utilities",
    label: m.features.groupUtilities,
    hrefs: [
      "/dashboard/embedbuilder",
      "/dashboard/polls",
      "/dashboard/suggestions",
      "/dashboard/channel-messages",
      "/dashboard/statchannels",
      "/dashboard/customvoice",
      "/dashboard/linkfix",
      "/dashboard/highlights",
      "/dashboard/afk",
      "/dashboard/todo",
      "/dashboard/wordoftheday",
      "/dashboard/chatsaver",
      "/dashboard/minecraft",
      "/dashboard/utility",
    ],
  },
  {
    id: "social",
    label: m.features.groupSocial,
    hrefs: ["/dashboard/alerts"],
  },
  {
    id: "games",
    label: m.features.groupGames,
    hrefs: [
      "/dashboard/currency",
      "/dashboard/giveaways",
      "/dashboard/birthday",
      "/dashboard/counting",
      "/dashboard/confessions",
      "/dashboard/reputation",
      "/dashboard/votes",
      "/dashboard/music",
    ],
  },
  {
    id: "insights",
    label: m.features.groupInsights,
    hrefs: [
      "/dashboard/serverstats",
      "/dashboard/messagestats",
      "/dashboard/liveboards",
      "/dashboard/auditlog",
    ],
  },
  {
    id: "more",
    label: m.features.groupMore,
    hrefs: [
      "/dashboard/settings",
      "/dashboard/import",
      "/dashboard/patreon",
      "/dashboard/feature-requests",
    ],
  },
];

/**
 * The dashboard pages of a group, in display order. Pages missing from the feature list are skipped.
 */
export function groupFeatures(group: NavigationGroup): NavigationItem[] {
  return group.hrefs
    .map((href) => allDashboardFeatures.find((item) => item.href === href))
    .filter((item): item is NavigationItem => !!item);
}
