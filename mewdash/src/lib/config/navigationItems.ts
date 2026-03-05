// Shared navigation items for both mobile and desktop navigation

export interface NavigationItem {
  label: string;
  icon: string;
  href: string;
  category: string;
  ownerOnly?: boolean;
  description?: string;
}

export const allDashboardFeatures: NavigationItem[] = [
  {
    label: "Administration",
    icon: "fa-utility-duo fa-regular fa-cog",
    href: "/dashboard/administration",
    category: "Security",
    description: "Server administration and automation",
  },
  {
    label: "AFK System",
    icon: "fa-utility-duo fa-regular fa-moon",
    href: "/dashboard/afk",
    category: "Actions",
    description: "Away from keyboard notifications",
  },
  {
    label: "Birthdays",
    icon: "fa-utility-duo fa-regular fa-birthday-cake",
    href: "/dashboard/birthday",
    category: "Community",
    description: "Birthday announcements and celebrations",
  },
  {
    label: "Chat Saver",
    icon: "fa-utility-duo fa-regular fa-folder",
    href: "/dashboard/chatsaver",
    category: "Security",
    description: "Save and archive chat messages",
  },
  {
    label: "Confessions",
    icon: "fa-utility-duo fa-regular fa-comment",
    href: "/dashboard/confessions",
    category: "Community",
    description: "Anonymous confession system",
  },
  {
    label: "Counting",
    icon: "fa-utility-duo fa-regular fa-hashtag",
    href: "/dashboard/counting",
    category: "Community",
    description: "Counting game channel",
  },
  {
    label: "Custom Voice",
    icon: "fa-utility-duo fa-regular fa-microphone",
    href: "/dashboard/customvoice",
    category: "Entertainment",
    description: "Custom voice channels",
  },
  {
    label: "Embeds",
    icon: "fa-utility-duo fa-regular fa-link",
    href: "/dashboard/embedbuilder",
    category: "Actions",
    description: "Create and manage embeds",
  },
  {
    label: "Feeds",
    icon: "fa-utility-duo fa-regular fa-newspaper",
    href: "/dashboard/feeds",
    category: "Actions",
    description: "RSS and social media feeds",
  },
  {
    label: "Forms",
    icon: "fa-utility-duo fa-regular fa-clipboard",
    href: "/dashboard/forms",
    category: "Community",
    description: "Custom forms and surveys",
  },
  {
    label: "Giveaways",
    icon: "fa-utility-duo fa-regular fa-gift",
    href: "/dashboard/giveaways",
    category: "Entertainment",
    description: "Manage server giveaways",
  },
  {
    label: "Greets",
    icon: "fa-utility-duo fa-regular fa-bell",
    href: "/dashboard/multigreets",
    category: "Actions",
    description: "Welcome and goodbye messages",
  },
  {
    label: "Highlights",
    icon: "fa-utility-duo fa-regular fa-bolt",
    href: "/dashboard/highlights",
    category: "Community",
    description: "Word highlights and notifications",
  },
  {
    label: "Invites",
    icon: "fa-utility-duo fa-regular fa-users",
    href: "/dashboard/invites",
    category: "Community",
    description: "Invite tracking and rewards",
  },
  {
    label: "Logging",
    icon: "fa-utility-duo fa-regular fa-file",
    href: "/dashboard/logging",
    category: "Security",
    description: "Server audit logs",
  },
  {
    label: "Message Stats",
    icon: "fa-utility-duo fa-regular fa-envelope",
    href: "/dashboard/messagestats",
    category: "Analytics",
    description: "Message activity statistics",
  },
  {
    label: "Moderation",
    icon: "fa-utility-duo fa-regular fa-flag",
    href: "/dashboard/moderation",
    category: "Security",
    description: "Moderation tools and settings",
  },
  {
    label: "Music",
    icon: "fa-utility-duo fa-regular fa-music",
    href: "/dashboard/music",
    category: "Entertainment",
    description: "Music player controls",
  },
  {
    label: "Patreon",
    icon: "fa-utility-duo fa-regular fa-heart",
    href: "/dashboard/patreon",
    category: "Community",
    description: "Patreon integration and rewards",
  },
  {
    label: "Performance",
    icon: "fa-utility-duo fa-regular fa-clock",
    href: "/dashboard/performance",
    category: "Analytics",
    description: "Bot performance metrics",
    ownerOnly: true,
  },
  {
    label: "Repeaters",
    icon: "fa-utility-duo fa-regular fa-sync",
    href: "/dashboard/repeaters",
    category: "Actions",
    description: "Scheduled repeated messages",
  },
  {
    label: "Reputation",
    icon: "fa-utility-duo fa-regular fa-trophy",
    href: "/dashboard/reputation",
    category: "Community",
    description: "User reputation system",
  },
  {
    label: "Role Greets",
    icon: "fa-utility-duo fa-regular fa-user",
    href: "/dashboard/rolegreets",
    category: "Actions",
    description: "Role-based greeting messages",
  },
  {
    label: "Role States",
    icon: "fa-utility-duo fa-regular fa-tag",
    href: "/dashboard/rolestates",
    category: "Actions",
    description: "Persistent role states",
  },
  {
    label: "Settings",
    icon: "fa-utility-duo fa-regular fa-cog",
    href: "/dashboard/settings",
    category: "Settings",
    description: "Bot configuration and roles",
  },
  {
    label: "Starboard",
    icon: "fa-utility-duo fa-regular fa-star",
    href: "/dashboard/starboard",
    category: "Community",
    description: "Star-based message board",
  },
  {
    label: "Status Roles",
    icon: "fa-utility-duo fa-regular fa-user-circle",
    href: "/dashboard/statusroles",
    category: "Actions",
    description: "Roles based on user status",
  },
  {
    label: "Streams",
    icon: "fa-utility-duo fa-regular fa-video",
    href: "/dashboard/streams",
    category: "Community",
    description: "Stream announcements",
  },
  {
    label: "Suggestions",
    icon: "fa-utility-duo fa-regular fa-lightbulb",
    href: "/dashboard/suggestions",
    category: "Community",
    description: "Server suggestion system",
  },
  {
    label: "Tickets",
    icon: "fa-utility-duo fa-regular fa-ticket",
    href: "/dashboard/tickets",
    category: "Entertainment",
    description: "Support ticket system",
  },
  {
    label: "Todo Lists",
    icon: "fa-utility-duo fa-regular fa-check",
    href: "/dashboard/todo",
    category: "Community",
    description: "Shared todo lists",
  },
  {
    label: "Triggers",
    icon: "fa-utility-duo fa-regular fa-comments",
    href: "/dashboard/chat-triggers",
    category: "Actions",
    description: "Custom chat triggers",
  },
  {
    label: "Votes",
    icon: "fa-utility-duo fa-regular fa-thumbs-up",
    href: "/dashboard/votes",
    category: "Community",
    description: "Voting and polls",
  },
  {
    label: "XP System",
    icon: "fa-utility-duo fa-regular fa-star",
    href: "/dashboard/xp",
    category: "Community",
    description: "Leveling and XP system",
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
