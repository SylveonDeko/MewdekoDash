// lib/api/logging/models/Logging.ts

export type LogType =
  | "Other"
  | "EventCreated"
  | "RoleUpdated"
  | "RoleCreated"
  | "RoleDeleted"
  | "ServerUpdated"
  | "ThreadCreated"
  | "UserRoleAdded"
  | "UserRoleRemoved"
  | "UsernameUpdated"
  | "NicknameUpdated"
  | "ThreadDeleted"
  | "ThreadUpdated"
  | "MessageUpdated"
  | "MessageDeleted"
  | "UserJoined"
  | "UserLeft"
  | "UserBanned"
  | "UserUnbanned"
  | "UserUpdated"
  | "ChannelCreated"
  | "ChannelDestroyed"
  | "ChannelUpdated"
  | "VoicePresence"
  | "VoicePresenceTts"
  | "UserMuted"
  | "InviteCreated"
  | "InviteDeleted"
  | "MessagesBulkDeleted"
  | "ReactionEvents"
  | "AvatarUpdated";

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
  {
    logType: "MessageUpdated",
    category: "messages",
    label: "Message Updated",
    displayName: "Message Updated",
    description: "Logs when a message is edited",
    icon: "edit",
  },
  {
    logType: "MessageDeleted",
    category: "messages",
    label: "Message Deleted",
    displayName: "Message Deleted",
    description: "Logs when a message is deleted",
    icon: "trash-2",
  },
  {
    logType: "MessagesBulkDeleted",
    category: "messages",
    label: "Messages Bulk Deleted",
    displayName: "Messages Bulk Deleted",
    description: "Logs when multiple messages are deleted at once",
    icon: "trash",
  },
  {
    logType: "ReactionEvents",
    category: "messages",
    label: "Reaction Events",
    displayName: "Reaction Events",
    description: "Logs when reactions are added or removed",
    icon: "plus-circle",
  },
  {
    logType: "ThreadCreated",
    category: "threads",
    label: "Thread Created",
    displayName: "Thread Created",
    description: "Logs when a new thread is created",
    icon: "plus-circle",
  },
  {
    logType: "ThreadDeleted",
    category: "threads",
    label: "Thread Deleted",
    displayName: "Thread Deleted",
    description: "Logs when a thread is deleted",
    icon: "trash",
  },
  {
    logType: "ThreadUpdated",
    category: "threads",
    label: "Thread Updated",
    displayName: "Thread Updated",
    description: "Logs when thread properties are updated",
    icon: "edit-3",
  },
  {
    logType: "UsernameUpdated",
    category: "users",
    label: "Username Updated",
    displayName: "Username Updated",
    description: "Logs when a user changes their username",
    icon: "user",
  },
  {
    logType: "NicknameUpdated",
    category: "users",
    label: "Nickname Updated",
    displayName: "Nickname Updated",
    description: "Logs when a user's nickname changes",
    icon: "edit",
  },
  {
    logType: "AvatarUpdated",
    category: "users",
    label: "Avatar Updated",
    displayName: "Avatar Updated",
    description: "Logs when a user updates their avatar",
    icon: "user",
  },
  {
    logType: "UserLeft",
    category: "users",
    label: "User Left",
    displayName: "User Left",
    description: "Logs when a user leaves the server",
    icon: "user-minus",
  },
  {
    logType: "UserJoined",
    category: "users",
    label: "User Joined",
    displayName: "User Joined",
    description: "Logs when a user joins the server",
    icon: "user-plus",
  },
  {
    logType: "UserUpdated",
    category: "users",
    label: "User Updated",
    displayName: "User Updated",
    description: "Logs when a user's profile is updated",
    icon: "user-check",
  },
  {
    logType: "UserRoleAdded",
    category: "users",
    label: "User Role Added",
    displayName: "User Role Added",
    description: "Logs when roles are added to a user",
    icon: "plus-circle",
  },
  {
    logType: "UserRoleRemoved",
    category: "users",
    label: "User Role Removed",
    displayName: "User Role Removed",
    description: "Logs when roles are removed from a user",
    icon: "minus-circle",
  },
  {
    logType: "UserBanned",
    category: "moderation",
    label: "User Banned",
    displayName: "User Banned",
    description: "Logs when a user is banned",
    icon: "ban",
  },
  {
    logType: "UserUnbanned",
    category: "moderation",
    label: "User Unbanned",
    displayName: "User Unbanned",
    description: "Logs when a user is unbanned",
    icon: "user-check",
  },
  {
    logType: "UserMuted",
    category: "moderation",
    label: "User Muted",
    displayName: "User Muted",
    description: "Logs when a user is muted",
    icon: "volume-x",
  },
  {
    logType: "VoicePresence",
    category: "voice",
    label: "Voice Presence",
    displayName: "Voice Presence",
    description: "Logs voice channel activity",
    icon: "mic",
  },
  {
    logType: "VoicePresenceTts",
    category: "voice",
    label: "Voice Presence TTS",
    displayName: "Voice Presence TTS",
    description: "Logs TTS usage in voice channels",
    icon: "volume-2",
  },
  {
    logType: "ServerUpdated",
    category: "server",
    label: "Server Updated",
    displayName: "Server Updated",
    description: "Logs when server settings change",
    icon: "settings",
  },
  {
    logType: "EventCreated",
    category: "server",
    label: "Event Created",
    displayName: "Event Created",
    description: "Logs when a server event is created",
    icon: "plus-circle",
  },
  {
    logType: "InviteCreated",
    category: "server",
    label: "Invite Created",
    displayName: "Invite Created",
    description: "Logs when an invite is created",
    icon: "plus-circle",
  },
  {
    logType: "InviteDeleted",
    category: "server",
    label: "Invite Deleted",
    displayName: "Invite Deleted",
    description: "Logs when an invite is deleted",
    icon: "trash",
  },
  {
    logType: "RoleUpdated",
    category: "roles",
    label: "Role Updated",
    displayName: "Role Updated",
    description: "Logs when role properties are updated",
    icon: "edit-3",
  },
  {
    logType: "RoleDeleted",
    category: "roles",
    label: "Role Deleted",
    displayName: "Role Deleted",
    description: "Logs when a role is deleted",
    icon: "trash",
  },
  {
    logType: "RoleCreated",
    category: "roles",
    label: "Role Created",
    displayName: "Role Created",
    description: "Logs when a new role is created",
    icon: "plus-circle",
  },
  {
    logType: "ChannelCreated",
    category: "channels",
    label: "Channel Created",
    displayName: "Channel Created",
    description: "Logs when a new channel is created",
    icon: "hash",
  },
  {
    logType: "ChannelDestroyed",
    category: "channels",
    label: "Channel Destroyed",
    displayName: "Channel Destroyed",
    description: "Logs when a channel is deleted",
    icon: "trash",
  },
  {
    logType: "ChannelUpdated",
    category: "channels",
    label: "Channel Updated",
    displayName: "Channel Updated",
    description: "Logs when channel properties are updated",
    icon: "edit-3",
  },
  {
    logType: "Other",
    category: "other",
    label: "Other",
    displayName: "Other",
    description: "Logs miscellaneous events",
    icon: "alert-triangle",
  },
] as const;
