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
  | "AvatarUpdated"
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
  | "EmojiCreated"
  | "EmojiUpdated"
  | "EmojiDeleted"
  | "StickerCreated"
  | "StickerUpdated"
  | "StickerDeleted"
  | "UserTimedOut"
  | "UserTimeoutRemoved"
  | "InviteLinkPosted"
  | "ChannelPermissionsUpdated"
  | "ServerBoosted"
  | "IntegrationChanged"
  | "WebhookChanged"
  | "StageChanged"
  | "ScheduledEventChanged"
  | "AutoModRuleChanged"
  | "SoundboardChanged"
  | "ThreadMemberChanged";

export interface LoggingConfigurationResponse {
  enabled: boolean;
  ignoredChannels: bigint[];
  logTypes: Record<string, bigint | null>;
  ignorePrefixes: string[];
  ignoreBots: boolean;
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

export interface LoggingExport {
  empty: boolean;
  code?: string;
  json?: string;
}

export interface LoggingImportResult {
  success: boolean;
  applied: number;
  unmapped: string[];
}
