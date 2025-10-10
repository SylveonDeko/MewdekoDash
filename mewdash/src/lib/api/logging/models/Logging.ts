// lib/api/logging/models/Logging.ts

export type LogType =
  | "Other"
  | "MessageUpdated"
  | "MessageDeleted"
  | "ThreadCreated"
  | "ThreadDeleted"
  | "ThreadUpdated"
  | "UsernameUpdated"
  | "NicknameUpdated"
  | "AvatarUpdated"
  | "UserLeft"
  | "UserBanned"
  | "UserUnbanned"
  | "UserUpdated"
  | "UserJoined"
  | "UserRoleAdded"
  | "UserRoleRemoved"
  | "UserMuted"
  | "VoicePresence"
  | "VoicePresenceTts"
  | "ServerUpdated"
  | "RoleUpdated"
  | "RoleDeleted"
  | "EventCreated"
  | "RoleCreated"
  | "ChannelCreated"
  | "ChannelDestroyed"
  | "ChannelUpdated";

export interface LoggingConfigurationResponse {
  enabled: boolean;
  ignoredChannels: bigint[];
  logTypes: Record<string, bigint | null>;
}

export interface SetLogChannelRequest {
  channelId: bigint | null;
}

export interface SetIgnoredChannelsRequest {
  channelIds: bigint[] | null;
}

export interface BulkUpdateLogChannelsRequest {
  logTypeMappings: Array<{
    logType: string;
    channelId: bigint | null;
  }>;
}

// Log type mapping configuration for UI
export const LOG_TYPE_MAPPINGS = [
  { logType: "MessageUpdated", category: "messages", label: "Message Updated" },
  { logType: "MessageDeleted", category: "messages", label: "Message Deleted" },
  { logType: "ThreadCreated", category: "threads", label: "Thread Created" },
  { logType: "ThreadDeleted", category: "threads", label: "Thread Deleted" },
  { logType: "ThreadUpdated", category: "threads", label: "Thread Updated" },
  { logType: "UsernameUpdated", category: "users", label: "Username Updated" },
  { logType: "NicknameUpdated", category: "users", label: "Nickname Updated" },
  { logType: "AvatarUpdated", category: "users", label: "Avatar Updated" },
  { logType: "UserLeft", category: "users", label: "User Left" },
  { logType: "UserBanned", category: "moderation", label: "User Banned" },
  { logType: "UserUnbanned", category: "moderation", label: "User Unbanned" },
  { logType: "UserUpdated", category: "users", label: "User Updated" },
  { logType: "UserJoined", category: "users", label: "User Joined" },
  { logType: "UserRoleAdded", category: "roles", label: "User Role Added" },
  { logType: "UserRoleRemoved", category: "roles", label: "User Role Removed" },
  { logType: "UserMuted", category: "moderation", label: "User Muted" },
  { logType: "VoicePresence", category: "voice", label: "Voice Presence" },
  {
    logType: "VoicePresenceTts",
    category: "voice",
    label: "Voice Presence TTS",
  },
  { logType: "ServerUpdated", category: "server", label: "Server Updated" },
  { logType: "RoleUpdated", category: "roles", label: "Role Updated" },
  { logType: "RoleDeleted", category: "roles", label: "Role Deleted" },
  { logType: "RoleCreated", category: "roles", label: "Role Created" },
  { logType: "EventCreated", category: "events", label: "Event Created" },
  { logType: "ChannelCreated", category: "channels", label: "Channel Created" },
  {
    logType: "ChannelDestroyed",
    category: "channels",
    label: "Channel Destroyed",
  },
  { logType: "ChannelUpdated", category: "channels", label: "Channel Updated" },
  { logType: "Other", category: "other", label: "Other" },
] as const;
