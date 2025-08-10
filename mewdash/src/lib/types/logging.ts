// Logging system types
export enum LogType {
  MessageDeleted = "message_deleted",
  MessageEdited = "message_edited",
  MessageBulkDeleted = "message_bulk_deleted",
  UserJoined = "user_joined",
  UserLeft = "user_left",
  UserBanned = "user_banned",
  UserUnbanned = "user_unbanned",
  UserKicked = "user_kicked",
  UserMuted = "user_muted",
  UserUnmuted = "user_unmuted",
  UserWarned = "user_warned",
  RoleCreated = "role_created",
  RoleDeleted = "role_deleted",
  RoleUpdated = "role_updated",
  ChannelCreated = "channel_created",
  ChannelDeleted = "channel_deleted",
  ChannelUpdated = "channel_updated",
  VoiceJoined = "voice_joined",
  VoiceLeft = "voice_left",
  VoiceMoved = "voice_moved",
  NicknameChanged = "nickname_changed",
  InviteCreated = "invite_created",
  InviteDeleted = "invite_deleted"
}

export interface LoggingConfigurationResponse {
  logChannels: Record<LogType, bigint>;
  ignoredChannels: bigint[];
  ignoredUsers: bigint[];
  isEnabled: boolean;
  logLevel: number;
  dateFormat: string;
}

export interface BulkUpdateLogChannelsRequest {
  updates: Array<{
    logType: LogType;
    channelId: bigint | null;
  }>;
}

export interface SetIgnoredChannelsRequest {
  channelIds: bigint[];
}

export interface SetLogChannelRequest {
  channelId: bigint;
}

export interface LogTypeMapping {
  logType: LogType;
  displayName: string;
  description: string;
  icon: string;
  category: 'messages' | 'users' | 'server' | 'voice' | 'moderation';
}

export const LOG_TYPE_MAPPINGS: LogTypeMapping[] = [
  // Messages
  {
    logType: LogType.MessageDeleted,
    displayName: "Message Deleted",
    description: "Log when messages are deleted",
    icon: "trash-2",
    category: "messages"
  },
  {
    logType: LogType.MessageEdited,
    displayName: "Message Edited",
    description: "Log when messages are edited",
    icon: "edit",
    category: "messages"
  },
  {
    logType: LogType.MessageBulkDeleted,
    displayName: "Bulk Message Deleted",
    description: "Log when messages are bulk deleted",
    icon: "trash",
    category: "messages"
  },
  // Users
  {
    logType: LogType.UserJoined,
    displayName: "User Joined",
    description: "Log when users join the server",
    icon: "user-plus",
    category: "users"
  },
  {
    logType: LogType.UserLeft,
    displayName: "User Left",
    description: "Log when users leave the server",
    icon: "user-minus",
    category: "users"
  },
  {
    logType: LogType.NicknameChanged,
    displayName: "Nickname Changed",
    description: "Log when users change nicknames",
    icon: "user",
    category: "users"
  },
  // Moderation
  {
    logType: LogType.UserBanned,
    displayName: "User Banned",
    description: "Log when users are banned",
    icon: "ban",
    category: "moderation"
  },
  {
    logType: LogType.UserUnbanned,
    displayName: "User Unbanned",
    description: "Log when users are unbanned",
    icon: "user-check",
    category: "moderation"
  },
  {
    logType: LogType.UserKicked,
    displayName: "User Kicked",
    description: "Log when users are kicked",
    icon: "user-x",
    category: "moderation"
  },
  {
    logType: LogType.UserMuted,
    displayName: "User Muted",
    description: "Log when users are muted",
    icon: "volume-x",
    category: "moderation"
  },
  {
    logType: LogType.UserUnmuted,
    displayName: "User Unmuted",
    description: "Log when users are unmuted",
    icon: "volume-2",
    category: "moderation"
  },
  {
    logType: LogType.UserWarned,
    displayName: "User Warned",
    description: "Log when users receive warnings",
    icon: "alert-triangle",
    category: "moderation"
  },
  // Server
  {
    logType: LogType.RoleCreated,
    displayName: "Role Created",
    description: "Log when roles are created",
    icon: "plus-circle",
    category: "server"
  },
  {
    logType: LogType.RoleDeleted,
    displayName: "Role Deleted",
    description: "Log when roles are deleted",
    icon: "minus-circle",
    category: "server"
  },
  {
    logType: LogType.RoleUpdated,
    displayName: "Role Updated",
    description: "Log when roles are modified",
    icon: "edit-3",
    category: "server"
  },
  {
    logType: LogType.ChannelCreated,
    displayName: "Channel Created",
    description: "Log when channels are created",
    icon: "hash",
    category: "server"
  },
  {
    logType: LogType.ChannelDeleted,
    displayName: "Channel Deleted",
    description: "Log when channels are deleted",
    icon: "trash-2",
    category: "server"
  },
  {
    logType: LogType.ChannelUpdated,
    displayName: "Channel Updated",
    description: "Log when channels are modified",
    icon: "settings",
    category: "server"
  },
  // Voice
  {
    logType: LogType.VoiceJoined,
    displayName: "Voice Joined",
    description: "Log when users join voice channels",
    icon: "mic",
    category: "voice"
  },
  {
    logType: LogType.VoiceLeft,
    displayName: "Voice Left",
    description: "Log when users leave voice channels",
    icon: "mic-off",
    category: "voice"
  },
  {
    logType: LogType.VoiceMoved,
    displayName: "Voice Moved",
    description: "Log when users move between voice channels",
    icon: "move",
    category: "voice"
  }
];