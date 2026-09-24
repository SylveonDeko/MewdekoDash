// Shared navigation items for both mobile and desktop navigation

export interface NavigationItem {
  label: string;
  icon: string;
  href: string;
  /**
   * Grouping used by the Dashboard Access page and matched on by search. The sidebar lists
   * features alphabetically and does not group by this.
   */
  category: string;
  /**
   * Bot owner tools. These live under /owner rather than /dashboard, and the sidebar shows a
   * single Owner Panel link instead of listing them.
   */
  ownerOnly?: boolean;
  description?: string;
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
export const allDashboardFeatures: NavigationItem[] = [
  {
    label: "Administration",
    icon: "fa-utility-duo fa-regular fa-cog",
    href: "/dashboard/administration",
    category: "Security",
    description: "Server administration and automation",
    keywords: ["admin", "administration", "protection", "roles"],
  },
  {
    label: "AFK System",
    icon: "fa-utility-duo fa-regular fa-moon",
    href: "/dashboard/afk",
    category: "Actions",
    description: "Away from keyboard notifications",
    keywords: ["afk", "away", "status", "idle"],
  },
  {
    label: "Audit Log",
    icon: "fa-utility-duo fa-regular fa-clipboard-check",
    href: "/dashboard/auditlog",
    category: "Security",
    description: "Who accessed the dashboard, what they changed and viewed",
    keywords: ["audit", "audit log", "history", "who changed", "accountability", "dashboard access log"],
  },
  {
    label: "Channel Access",
    icon: "fa-utility-duo fa-regular fa-lock",
    href: "/dashboard/channel-access",
    category: "Security",
    description: "Applications and member votes for locked channels",
    keywords: ["channel access", "applications", "apply", "vote", "locked", "gate", "private"],
  },
  {
    label: "Birthdays",
    icon: "fa-utility-duo fa-regular fa-birthday-cake",
    href: "/dashboard/birthday",
    category: "Community",
    description: "Birthday announcements and celebrations",
    keywords: ["birthday", "birthdays", "celebrate", "anniversary"],
  },
  {
    label: "Word of the Day",
    icon: "fa-utility-duo fa-regular fa-book-open",
    href: "/dashboard/wordoftheday",
    category: "Community",
    description: "Daily vocabulary word with topics, filters, and custom lists",
    keywords: ["word of the day", "wotd", "vocabulary", "dictionary", "definition", "daily word", "datamuse"],
  },
  {
    label: "Chat Saver",
    icon: "fa-utility-duo fa-regular fa-folder",
    href: "/dashboard/chatsaver",
    category: "Security",
    description: "Save and archive chat messages",
    keywords: ["chat saver", "audit", "history", "messages"],
  },
  {
    label: "Dashboard Access",
    icon: "fa-utility-duo fa-regular fa-key",
    href: "/dashboard/access",
    category: "Security",
    description: "Grant restricted dashboard access to specific users and roles",
    keywords: ["dashboard access", "permissions", "grant", "staff", "restrict", "who can edit"],
  },
  {
    label: "Confessions",
    icon: "fa-utility-duo fa-regular fa-comment",
    href: "/dashboard/confessions",
    category: "Community",
    description: "Anonymous confession system",
    keywords: ["confessions", "anonymous", "secrets"],
  },
  {
    label: "Counting",
    icon: "fa-utility-duo fa-regular fa-list-numeric",
    href: "/dashboard/counting",
    category: "Community",
    description: "Counting game channel",
    keywords: ["counting", "numbers", "game", "channel"],
  },
  {
    label: "Currency",
    icon: "fa-utility-duo fa-regular fa-money-bill",
    href: "/dashboard/currency",
    category: "Entertainment",
    description: "Economy tuning, shop, balances and payout analytics",
    keywords: ["currency", "economy", "money", "shop", "balance", "coins", "payout", "gambling"],
  },
  {
    label: "Minecraft",
    icon: "fa-utility-duo fa-regular fa-server",
    href: "/dashboard/minecraft",
    category: "Entertainment",
    description: "Minecraft server monitoring and status",
    keywords: ["minecraft", "server status", "mc", "bridge", "monitoring"],
  },
  {
    label: "Stat Channels",
    icon: "fa-utility-duo fa-regular fa-chart-simple",
    href: "/dashboard/statchannels",
    category: "Community",
    description: "Voice channels displaying live server stats",
    keywords: ["stat channels", "counter", "member count", "live stats", "voice channel stats"],
  },
  {
    label: "Custom Voice",
    icon: "fa-utility-duo fa-regular fa-microphone",
    href: "/dashboard/customvoice",
    category: "Entertainment",
    description: "Custom voice channels",
    keywords: ["voice", "channels", "temporary", "custom"],
  },
  {
    label: "Embeds",
    icon: "fa-utility-duo fa-regular fa-link",
    href: "/dashboard/embedbuilder",
    category: "Actions",
    description: "Create and manage embeds",
    keywords: ["embeds", "builder", "custom", "messages"],
  },
  {
    label: "Feeds",
    icon: "fa-utility-duo fa-regular fa-newspaper",
    href: "/dashboard/feeds",
    category: "Actions",
    description: "RSS and social media feeds",
    keywords: ["feeds", "rss", "news", "updates"],
  },
  {
    label: "Forms",
    icon: "fa-utility-duo fa-regular fa-clipboard",
    href: "/dashboard/forms",
    category: "Community",
    description: "Custom forms and surveys",
    keywords: ["forms", "surveys", "questionnaire", "applications", "responses"],
  },
  {
    label: "Giveaways",
    icon: "fa-utility-duo fa-regular fa-gift",
    href: "/dashboard/giveaways",
    category: "Entertainment",
    description: "Manage server giveaways",
    keywords: ["giveaways", "contests", "prizes", "events"],
  },
  {
    label: "Greets",
    icon: "fa-utility-duo fa-regular fa-bell",
    href: "/dashboard/multigreets",
    category: "Actions",
    description: "Welcome and goodbye messages",
    keywords: ["greets", "welcome", "goodbye", "messages", "join message", "leave message"],
  },
  {
    label: "Highlights",
    icon: "fa-utility-duo fa-regular fa-bolt",
    href: "/dashboard/highlights",
    category: "Community",
    description: "Word highlights and notifications",
    keywords: ["highlights", "keywords", "notifications", "mentions"],
  },
  {
    label: "Invites",
    icon: "fa-utility-duo fa-regular fa-users",
    href: "/dashboard/invites",
    category: "Community",
    description: "Invite tracking, fake detection, labels and growth analytics",
    keywords: ["invites", "tracking", "referrals", "recruitment", "invite tracker", "fake invites", "bonus invites", "retention", "vanity", "labels", "who invited"],
  },
  {
    label: "Activity Stats",
    icon: "fa-utility-duo fa-regular fa-chart-simple",
    href: "/dashboard/serverstats",
    category: "Analytics",
    description: "Messages, voice time, games and member growth over time",
    keywords: ["activity", "stats", "statbot", "voice", "games", "presence", "lookback", "top", "chart", "charts", "privacy", "snapshots", "growth"],
  },
  {
    label: "Stat Roles",
    icon: "fa-utility-duo fa-regular fa-trophy",
    href: "/dashboard/statroles",
    category: "Community",
    description: "Roles granted and removed by activity over time",
    keywords: ["stat roles", "statroles", "activity roles", "active member", "inactive", "top chatter", "voice role", "invite rewards", "message rewards", "streak"],
  },
  {
    label: "Live Boards",
    icon: "fa-utility-duo fa-regular fa-thumbtack",
    href: "/dashboard/liveboards",
    category: "Community",
    description: "Pinned leaderboards, charts and scheduled server reports",
    keywords: ["live boards", "pinned leaderboard", "pin leaderboard", "auto update", "server report", "weekly report", "monthly report", "digest"],
  },
  {
    label: "Logging",
    icon: "fa-utility-duo fa-regular fa-file",
    href: "/dashboard/logging",
    category: "Security",
    description: "Server audit logs",
    keywords: ["logging", "events", "audit", "history"],
  },
  {
    label: "Message Stats",
    icon: "fa-utility-duo fa-regular fa-envelope",
    href: "/dashboard/messagestats",
    category: "Analytics",
    description: "Message activity statistics",
    keywords: ["message stats", "activity", "tracking", "analytics"],
  },
  {
    label: "Message Filters",
    icon: "fa-utility-duo fa-regular fa-filter",
    href: "/dashboard/filter",
    category: "Security",
    description: "Block words, invites, and links",
    keywords: ["filter", "word filter", "invite filter", "link filter", "automod", "auto ban", "blacklist"],
  },
  {
    label: "Polls",
    icon: "fa-utility-duo fa-regular fa-chart-simple",
    href: "/dashboard/polls",
    category: "Community",
    description: "Create, schedule, and review polls",
    keywords: ["poll", "vote", "survey", "question", "schedule"],
  },
  {
    label: "Utilities",
    icon: "fa-utility-duo fa-regular fa-wrench",
    href: "/dashboard/utility",
    category: "Actions",
    description: "Aliases, quotes, auto publish, stream roles, AI, NSFW filters",
    keywords: ["alias", "quote", "autopublish", "publish", "stream role", "ai", "chatbot", "nsfw", "role monitor"],
  },
  {
    label: "Moderation",
    icon: "fa-utility-duo fa-regular fa-flag",
    href: "/dashboard/moderation",
    category: "Security",
    description: "Moderation tools and settings",
    keywords: ["moderation", "warnings", "punishments", "discipline"],
  },
  {
    label: "Music",
    icon: "fa-utility-duo fa-regular fa-music",
    href: "/dashboard/music",
    category: "Entertainment",
    description: "Music player controls",
    keywords: ["music", "player", "songs", "queue", "audio"],
  },
  {
    label: "Patreon",
    icon: "fa-utility-duo fa-regular fa-heart",
    href: "/dashboard/patreon",
    category: "Community",
    description: "Patreon integration and rewards",
    keywords: ["patreon", "supporters", "donations", "premium"],
  },
  {
    label: "Feature Requests",
    icon: "fa-utility-duo fa-regular fa-lightbulb",
    href: "/dashboard/feature-requests",
    category: "Community",
    description: "Suggest features, report bugs, and upvote what others asked for",
    keywords: ["feature request", "suggest", "suggestion", "idea", "bug report", "feedback", "roadmap", "upvote"],
  },
  {
    label: "Repeaters",
    icon: "fa-utility-duo fa-regular fa-sync",
    href: "/dashboard/repeaters",
    category: "Actions",
    description: "Scheduled repeated messages",
    keywords: ["repeaters", "recurring", "scheduled", "messages"],
  },
  {
    label: "Reputation",
    icon: "fa-utility-duo fa-regular fa-trophy",
    href: "/dashboard/reputation",
    category: "Community",
    description: "User reputation system",
    keywords: ["reputation", "rep", "rewards", "karma"],
  },
  {
    label: "Role Greets",
    icon: "fa-utility-duo fa-regular fa-user",
    href: "/dashboard/rolegreets",
    category: "Actions",
    description: "Role-based greeting messages",
    keywords: ["role greets", "welcome", "roles", "messages"],
  },
  {
    label: "Role Menus",
    icon: "fa-utility-duo fa-regular fa-list-ul",
    href: "/dashboard/role-menus",
    category: "Actions",
    description: "Dropdowns and buttons that let members pick their own roles",
    keywords: ["role menus", "self roles", "self assign", "pick roles", "dropdown", "buttons", "pronouns", "color roles", "reaction roles"],
  },
  {
    label: "Role States",
    icon: "fa-utility-duo fa-regular fa-tag",
    href: "/dashboard/rolestates",
    category: "Actions",
    description: "Persistent role states",
    keywords: ["role states", "persistence", "memory", "restore"],
  },
  {
    label: "Settings",
    icon: "fa-utility-duo fa-regular fa-cog",
    href: "/dashboard/settings",
    category: "Settings",
    description: "Bot configuration and roles",
    keywords: ["settings", "config", "general", "bot", "prefix"],
  },
  {
    label: "Starboard",
    icon: "fa-utility-duo fa-regular fa-star",
    href: "/dashboard/starboard",
    category: "Community",
    description: "Star-based message board",
    keywords: ["starboard", "stars", "popular", "messages", "highlights"],
  },
  {
    label: "Status Roles",
    icon: "fa-utility-duo fa-regular fa-user-circle",
    href: "/dashboard/statusroles",
    category: "Actions",
    description: "Roles based on user status",
    keywords: ["status roles", "custom status", "roles", "automation"],
  },
  {
    label: "Stream Alerts",
    icon: "fa-utility-duo fa-regular fa-video",
    href: "/dashboard/streams",
    category: "Community",
    description: "Go-live announcements for Twitch, YouTube, Kick and more",
    keywords: ["streams", "twitch", "youtube", "notifications"],
  },
  {
    label: "Twitch Bot",
    icon: "fa-brands fa-twitch",
    href: "/dashboard/twitch",
    category: "Community",
    description: "Chat bot for your own Twitch channel (commands, timers, events)",
    keywords: ["twitch", "chat bot", "integration", "streamer"],
  },
  {
    label: "Suggestions",
    icon: "fa-utility-duo fa-regular fa-lightbulb",
    href: "/dashboard/suggestions",
    category: "Community",
    description: "Server suggestion system",
    keywords: ["suggestions", "voting", "ideas", "feedback"],
  },
  {
    label: "Tickets",
    icon: "fa-utility-duo fa-regular fa-ticket",
    href: "/dashboard/tickets",
    category: "Community",
    description: "Support ticket panels, cases, and staff tools",
    keywords: ["tickets", "support", "help", "assistance", "panels"],
  },
  {
    label: "Todo Lists",
    icon: "fa-utility-duo fa-regular fa-check",
    href: "/dashboard/todo",
    category: "Community",
    description: "Shared todo lists",
    keywords: ["todo", "tasks", "lists", "management"],
  },
  {
    label: "Triggers",
    icon: "fa-utility-duo fa-regular fa-comments",
    href: "/dashboard/chat-triggers",
    category: "Actions",
    description: "Custom chat triggers",
    keywords: ["triggers", "autoresponder", "reactions", "chat"],
  },
  {
    label: "Votes",
    icon: "fa-utility-duo fa-regular fa-thumbs-up",
    href: "/dashboard/votes",
    category: "Community",
    description: "Voting and polls",
    keywords: ["votes", "voting", "rewards", "incentives"],
  },
  {
    label: "XP System",
    icon: "fa-utility-duo fa-regular fa-star",
    href: "/dashboard/xp",
    category: "Community",
    description: "Leveling and XP system",
    keywords: ["xp", "experience", "levels", "ranking", "leaderboard"],
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
    label: "Docker",
    icon: "fa-utility-duo fa-regular fa-box",
    href: "/owner/docker",
    category: "Analytics",
    description: "Containers and compose projects on the bot's host",
    keywords: ["docker", "containers", "compose", "images", "restart", "stop", "start", "selfhost", "fleet"],
  },
  {
    label: "Bot Hells",
    icon: "fa-utility-duo fa-regular fa-robot",
    href: "/owner/bot-hells",
    category: "Analytics",
    description: "Servers littered with bots, with bulk leave",
    keywords: ["bot hell", "bot farm", "bots", "bot ratio", "leave", "bulk leave", "spam servers"],
  },
  {
    label: "Leave Feedback",
    icon: "fa-utility-duo fa-regular fa-comments",
    href: "/owner/leave-feedback",
    category: "Analytics",
    description: "Why servers removed the bot, answered by their owners",
    keywords: ["leave feedback", "kick feedback", "why removed", "churn", "exit survey"],
  },
  {
    label: "Analytics",
    icon: "fa-utility-duo fa-regular fa-chart-simple",
    href: "/owner/analytics",
    category: "Analytics",
    description: "Fleet telemetry, commands, events, errors, growth and alerts",
    keywords: ["analytics", "telemetry", "metrics", "commands", "events", "errors", "growth", "alerts", "shards", "latency"],
  },
  {
    label: "Performance",
    icon: "fa-utility-duo fa-regular fa-clock",
    href: "/owner/performance",
    category: "Analytics",
    description: "Bot performance metrics",
    keywords: ["performance", "metrics", "cpu", "memory", "latency", "monitoring"],
  },
  {
    label: "Process Logs",
    icon: "fa-utility-duo fa-regular fa-rectangle-code",
    href: "/owner/process-logs",
    category: "Analytics",
    description: "Read and follow the pm2 logs on the bot's host",
    keywords: ["pm2", "logs", "console", "stdout", "stderr", "tail", "process", "crash", "stack trace"],
  },
].map(item => ({ ...item, ownerOnly: true }));

/**
 * Both lists together, for lookups by href that do not care which area a page lives in.
 */
export const allFeatures: NavigationItem[] = [...allDashboardFeatures, ...ownerFeatures];
