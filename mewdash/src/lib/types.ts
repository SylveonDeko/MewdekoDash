// lib/types.ts
export interface User {
  id: string;
  username: string;
  avatar: string;
}

export interface Guild {
  id: string;
  name: string;
  icon: string;
}

export interface AfkStatus {
  userId: string;
  guildId: string;
  message: string;
  timestamp: string;
}

export interface ChatTrigger {
  id: string;
  guildId: string;
  trigger: string;
  response: string;
}

export interface GuildConfig {
  guildId: string;
  prefix: string;
  // Add other config properties as needed
}

export interface Suggestion {
  id: string;
  guildId: string;
  userId: string;
  content: string;
  status: "pending" | "approved" | "denied" | "implemented";
}

export interface Giveaways {
  id: number;
  when: string;
  channelId: string;
  serverId: string;
  ended: number;
  messageId: string;
  winners: number;
  userId: string;
  item: string | null;
  restrictTo: string | null;
  blacklistUsers: string | null;
  blacklistRoles: string | null;
  emote: string | null;
  useButton: boolean;
  useCaptcha: boolean;
}

export interface PermissionOverride {
  perm: bigint;
  guildId: bigint;
  command: string;
  id: number;
  dateAdded: string;
}
