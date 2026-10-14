// Shared navigation items for both mobile and desktop navigation
import { m } from "$lib/i18n";

export interface NavigationItem {
  /** Localized display name accessor; call it at render time (`item.label()`). */
  label: () => string;
  icon: string;
  href: string;
  /**
   * Grouping used by the Dashboard Access page and matched on by search. The sidebar lists
   * features alphabetically and does not group by this.
   */
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
    keywords: ["admin", "administration", "protection", "roles"],
  },
  {
    label: m.features.afkName,
    icon: "fa-utility-duo fa-regular fa-moon",
    href: "/dashboard/afk",
    category: "Actions",
    categoryLabel: m.features.categoryActions,
    description: m.features.afkDescription,
    keywords: ["afk", "away", "status", "idle"],
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
    keywords: ["currency", "economy", "money", "shop", "balance", "coins", "payout", "gambling"],
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
    label: m.features.feedsName,
    icon: "fa-utility-duo fa-regular fa-newspaper",
    href: "/dashboard/feeds",
    category: "Actions",
    categoryLabel: m.features.categoryActions,
    description: m.features.feedsDescription,
    keywords: ["feeds", "rss", "news", "updates"],
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
    keywords: ["greets", "welcome", "goodbye", "messages", "join message", "leave message"],
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
    label: m.features.statrolesName,
    icon: "fa-utility-duo fa-regular fa-trophy",
    href: "/dashboard/statroles",
    category: "Community",
    categoryLabel: m.features.categoryCommunity,
    description: m.features.statrolesDescription,
    keywords: ["stat roles", "statroles", "activity roles", "active member", "inactive", "top chatter", "voice role", "invite rewards", "message rewards", "streak"],
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
    label: m.features.filterName,
    icon: "fa-utility-duo fa-regular fa-filter",
    href: "/dashboard/filter",
    category: "Security",
    categoryLabel: m.features.categorySecurity,
    description: m.features.filterDescription,
    keywords: ["filter", "word filter", "invite filter", "link filter", "automod", "auto ban", "blacklist"],
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
    label: m.features.repeatersName,
    icon: "fa-utility-duo fa-regular fa-sync",
    href: "/dashboard/repeaters",
    category: "Actions",
    categoryLabel: m.features.categoryActions,
    description: m.features.repeatersDescription,
    keywords: ["repeaters", "recurring", "scheduled", "messages"],
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
    label: m.features.rolegreetsName,
    icon: "fa-utility-duo fa-regular fa-user",
    href: "/dashboard/rolegreets",
    category: "Actions",
    categoryLabel: m.features.categoryActions,
    description: m.features.rolegreetsDescription,
    keywords: ["role greets", "welcome", "roles", "messages"],
  },
  {
    label: m.features.roleMenusName,
    icon: "fa-utility-duo fa-regular fa-list-ul",
    href: "/dashboard/role-menus",
    category: "Actions",
    categoryLabel: m.features.categoryActions,
    description: m.features.roleMenusDescription,
    keywords: ["role menus", "self roles", "self assign", "pick roles", "dropdown", "buttons", "pronouns", "color roles", "reaction roles"],
  },
  {
    label: m.features.rolestatesName,
    icon: "fa-utility-duo fa-regular fa-tag",
    href: "/dashboard/rolestates",
    category: "Actions",
    categoryLabel: m.features.categoryActions,
    description: m.features.rolestatesDescription,
    keywords: ["role states", "persistence", "memory", "restore"],
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
    label: m.features.statusrolesName,
    icon: "fa-utility-duo fa-regular fa-user-circle",
    href: "/dashboard/statusroles",
    category: "Actions",
    categoryLabel: m.features.categoryActions,
    description: m.features.statusrolesDescription,
    keywords: ["status roles", "custom status", "roles", "automation"],
  },
  {
    label: m.features.streamsName,
    icon: "fa-utility-duo fa-regular fa-video",
    href: "/dashboard/streams",
    category: "Community",
    categoryLabel: m.features.categoryCommunity,
    description: m.features.streamsDescription,
    keywords: ["streams", "twitch", "youtube", "notifications"],
  },
  {
    label: m.features.twitchName,
    icon: "fa-brands fa-twitch",
    href: "/dashboard/twitch",
    category: "Community",
    categoryLabel: m.features.categoryCommunity,
    description: m.features.twitchDescription,
    keywords: ["twitch", "chat bot", "integration", "streamer"],
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
    keywords: ["triggers", "autoresponder", "reactions", "chat"],
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
    keywords: ["xp", "experience", "levels", "ranking", "leaderboard"],
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
