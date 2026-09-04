// Shared navigation items for both mobile and desktop navigation

export interface NavigationItem {
  label: string;
  icon: string;
  href: string;
  category: string;
  ownerOnly?: boolean;
  description?: string;
  /**
   * Extra terms the command palette matches on, for words users search that do not
   * appear in the label or description ("autoresponder" for Triggers).
   */
  keywords?: string[];
}

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
    description: "Invite tracking and rewards",
    keywords: ["invites", "tracking", "referrals", "recruitment"],
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
    label: "Leave Feedback",
    icon: "fa-utility-duo fa-regular fa-comments",
    href: "/dashboard/leave-feedback",
    category: "Analytics",
    description: "Why servers removed the bot, answered by their owners",
    ownerOnly: true,
    keywords: ["leave feedback", "kick feedback", "why removed", "churn", "exit survey"],
  },
  {
    label: "Performance",
    icon: "fa-utility-duo fa-regular fa-clock",
    href: "/dashboard/performance",
    category: "Analytics",
    description: "Bot performance metrics",
    ownerOnly: true,
    keywords: ["performance", "metrics", "cpu", "memory", "latency", "monitoring"],
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
    label: "Streams",
    icon: "fa-utility-duo fa-regular fa-video",
    href: "/dashboard/streams",
    category: "Community",
    description: "Stream announcements",
    keywords: ["streams", "twitch", "youtube", "notifications"],
  },
  {
    label: "Twitch",
    icon: "fa-brands fa-twitch",
    href: "/dashboard/twitch",
    category: "Community",
    description: "Twitch chat bot and channel integration",
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
    category: "Entertainment",
    description: "Support ticket system",
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
