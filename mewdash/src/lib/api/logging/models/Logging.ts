// lib/api/logging/models/Logging.ts
import { m } from "$lib/i18n";

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

// Log type mapping configuration for UI. displayName and description are accessor functions, call them at render time.
export const LOG_TYPE_MAPPINGS = [
  {
    logType: "MessageUpdated",
    category: "messages",
    displayName: m.logging.logtypeMessageUpdated,
    description: m.logging.logtypeMessageUpdatedDescription,
    icon: "edit",
  },
  {
    logType: "MessageDeleted",
    category: "messages",
    displayName: m.features.wizardMessageDeletedName,
    description: m.logging.logtypeMessageDeletedDescription,
    icon: "trash-2",
  },
  {
    logType: "MessagesBulkDeleted",
    category: "messages",
    displayName: m.features.wizardMessagesBulkDeletedName,
    description: m.logging.logtypeMessagesBulkDeletedDescription,
    icon: "trash",
  },
  {
    logType: "ReactionEvents",
    category: "messages",
    displayName: m.logging.logtypeReactionEvents,
    description: m.logging.logtypeReactionEventsDescription,
    icon: "plus-circle",
  },
  {
    logType: "ThreadCreated",
    category: "threads",
    displayName: m.features.wizardThreadCreatedName,
    description: m.logging.logtypeThreadCreatedDescription,
    icon: "plus-circle",
  },
  {
    logType: "ThreadDeleted",
    category: "threads",
    displayName: m.features.wizardThreadDeletedName,
    description: m.logging.logtypeThreadDeletedDescription,
    icon: "trash",
  },
  {
    logType: "ThreadUpdated",
    category: "threads",
    displayName: m.features.wizardThreadUpdatedName,
    description: m.logging.logtypeThreadUpdatedDescription,
    icon: "edit-3",
  },
  {
    logType: "UsernameUpdated",
    category: "users",
    displayName: m.logging.logtypeUsernameUpdated,
    description: m.logging.logtypeUsernameUpdatedDescription,
    icon: "user",
  },
  {
    logType: "NicknameUpdated",
    category: "users",
    displayName: m.logging.logtypeNicknameUpdated,
    description: m.logging.logtypeNicknameUpdatedDescription,
    icon: "edit",
  },
  {
    logType: "AvatarUpdated",
    category: "users",
    displayName: m.logging.logtypeAvatarUpdated,
    description: m.logging.logtypeAvatarUpdatedDescription,
    icon: "user",
  },
  {
    logType: "UserLeft",
    category: "users",
    displayName: m.logging.logtypeUserLeft,
    description: m.logging.logtypeUserLeftDescription,
    icon: "user-minus",
  },
  {
    logType: "UserJoined",
    category: "users",
    displayName: m.logging.logtypeUserJoined,
    description: m.logging.logtypeUserJoinedDescription,
    icon: "user-plus",
  },
  {
    logType: "UserUpdated",
    category: "users",
    displayName: m.logging.logtypeUserUpdated,
    description: m.logging.logtypeUserUpdatedDescription,
    icon: "user-check",
  },
  {
    logType: "UserRoleAdded",
    category: "users",
    displayName: m.logging.logtypeUserRoleAdded,
    description: m.logging.logtypeUserRoleAddedDescription,
    icon: "plus-circle",
  },
  {
    logType: "UserRoleRemoved",
    category: "users",
    displayName: m.logging.logtypeUserRoleRemoved,
    description: m.logging.logtypeUserRoleRemovedDescription,
    icon: "minus-circle",
  },
  {
    logType: "UserBanned",
    category: "moderation",
    displayName: m.logging.logtypeUserBanned,
    description: m.logging.logtypeUserBannedDescription,
    icon: "ban",
  },
  {
    logType: "UserUnbanned",
    category: "moderation",
    displayName: m.logging.logtypeUserUnbanned,
    description: m.logging.logtypeUserUnbannedDescription,
    icon: "user-check",
  },
  {
    logType: "UserMuted",
    category: "moderation",
    displayName: m.logging.logtypeUserMuted,
    description: m.logging.logtypeUserMutedDescription,
    icon: "volume-x",
  },
  {
    logType: "VoicePresence",
    category: "voice",
    displayName: m.logging.logtypeVoicePresence,
    description: m.logging.logtypeVoicePresenceDescription,
    icon: "mic",
  },
  {
    logType: "VoicePresenceTts",
    category: "voice",
    displayName: m.logging.logtypeVoicePresenceTts,
    description: m.logging.logtypeVoicePresenceTtsDescription,
    icon: "volume-2",
  },
  {
    logType: "ServerUpdated",
    category: "server",
    displayName: m.features.wizardServerUpdatedName,
    description: m.logging.logtypeServerUpdatedDescription,
    icon: "settings",
  },
  {
    logType: "EventCreated",
    category: "server",
    displayName: m.features.wizardEventCreatedName,
    description: m.logging.logtypeEventCreatedDescription,
    icon: "plus-circle",
  },
  {
    logType: "InviteCreated",
    category: "server",
    displayName: m.features.wizardInviteCreatedName,
    description: m.logging.logtypeInviteCreatedDescription,
    icon: "plus-circle",
  },
  {
    logType: "InviteDeleted",
    category: "server",
    displayName: m.features.wizardInviteDeletedName,
    description: m.logging.logtypeInviteDeletedDescription,
    icon: "trash",
  },
  {
    logType: "RoleUpdated",
    category: "roles",
    displayName: m.features.wizardRoleUpdatedName,
    description: m.logging.logtypeRoleUpdatedDescription,
    icon: "edit-3",
  },
  {
    logType: "RoleDeleted",
    category: "roles",
    displayName: m.features.wizardRoleDeletedName,
    description: m.logging.logtypeRoleDeletedDescription,
    icon: "trash",
  },
  {
    logType: "RoleCreated",
    category: "roles",
    displayName: m.features.wizardRoleCreatedName,
    description: m.logging.logtypeRoleCreatedDescription,
    icon: "plus-circle",
  },
  {
    logType: "ChannelCreated",
    category: "channels",
    displayName: m.features.wizardChannelCreatedName,
    description: m.logging.logtypeChannelCreatedDescription,
    icon: "hash",
  },
  {
    logType: "ChannelDestroyed",
    category: "channels",
    displayName: m.logging.logtypeChannelDestroyed,
    description: m.logging.logtypeChannelDestroyedDescription,
    icon: "trash",
  },
  {
    logType: "ChannelUpdated",
    category: "channels",
    displayName: m.features.wizardChannelUpdatedName,
    description: m.logging.logtypeChannelUpdatedDescription,
    icon: "edit-3",
  },
  {
    logType: "Other",
    category: "other",
    displayName: m.common.other,
    description: m.logging.logtypeOtherDescription,
    icon: "alert-triangle",
  },
] as const;
