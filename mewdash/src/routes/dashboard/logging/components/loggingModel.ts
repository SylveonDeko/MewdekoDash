import { m } from "$lib/i18n";
import type { LogType } from "$lib/api/index.ts";

export interface Named {
  id: string;
  name: string;
}

export type LogGroupId =
  | "messages"
  | "members"
  | "moderation"
  | "voice"
  | "channels"
  | "threads"
  | "roles"
  | "server"
  | "other";

export const LOG_GROUPS: ReadonlyArray<{ id: LogGroupId; icon: string; types: readonly LogType[] }> = [
  {
    id: "messages",
    icon: "fa-message",
    types: ["MessageUpdated", "MessageDeleted", "MessagesBulkDeleted", "ReactionEvents", "InviteLinkPosted"]
  },
  {
    id: "members",
    icon: "fa-user",
    types: [
      "UserJoined",
      "UserLeft",
      "UserUpdated",
      "UsernameUpdated",
      "NicknameUpdated",
      "AvatarUpdated",
      "UserRoleAdded",
      "UserRoleRemoved"
    ]
  },
  {
    id: "moderation",
    icon: "fa-shield",
    types: ["UserBanned", "UserUnbanned", "UserMuted", "UserTimedOut", "UserTimeoutRemoved", "AutoModRuleChanged"]
  },
  { id: "voice", icon: "fa-microphone", types: ["VoicePresence", "VoicePresenceTts", "StageChanged"] },
  {
    id: "channels",
    icon: "fa-hashtag",
    types: ["ChannelCreated", "ChannelUpdated", "ChannelDestroyed", "ChannelPermissionsUpdated"]
  },
  {
    id: "threads",
    icon: "fa-comments",
    types: ["ThreadCreated", "ThreadUpdated", "ThreadDeleted", "ThreadMemberChanged"]
  },
  { id: "roles", icon: "fa-user-tag", types: ["RoleCreated", "RoleUpdated", "RoleDeleted"] },
  {
    id: "server",
    icon: "fa-server",
    types: [
      "ServerUpdated",
      "ServerBoosted",
      "EventCreated",
      "ScheduledEventChanged",
      "InviteCreated",
      "InviteDeleted",
      "EmojiCreated",
      "EmojiUpdated",
      "EmojiDeleted",
      "StickerCreated",
      "StickerUpdated",
      "StickerDeleted",
      "SoundboardChanged",
      "IntegrationChanged",
      "WebhookChanged"
    ]
  },
  { id: "other", icon: "fa-file-lines", types: ["Other"] }
];

export const ALL_LOG_TYPES: LogType[] = LOG_GROUPS.flatMap(group => [...group.types]);

export function groupName(id: LogGroupId): string {
  const names: Record<LogGroupId, () => string> = {
    messages: m.common.messages,
    members: m.logging.groupMembers,
    moderation: m.features.categoryModeration,
    voice: m.features.categoryVoice,
    channels: m.common.channels,
    threads: m.common.threads,
    roles: m.common.roles,
    server: m.features.categoryServer,
    other: m.common.other
  };
  return names[id]();
}

export function eventName(type: LogType): string {
  const names: Record<LogType, () => string> = {
    MessageUpdated: m.logging.eventMessageUpdated,
    MessageDeleted: m.logging.eventMessageDeleted,
    MessagesBulkDeleted: m.logging.eventMessagesBulkDeleted,
    ReactionEvents: m.logging.eventReactionEvents,
    InviteLinkPosted: m.logging.eventInviteLinkPosted,
    UserJoined: m.logging.eventUserJoined,
    UserLeft: m.logging.eventUserLeft,
    UserUpdated: m.logging.eventUserUpdated,
    UsernameUpdated: m.logging.eventUsernameUpdated,
    NicknameUpdated: m.logging.eventNicknameUpdated,
    AvatarUpdated: m.logging.eventAvatarUpdated,
    UserRoleAdded: m.logging.eventUserRoleAdded,
    UserRoleRemoved: m.logging.eventUserRoleRemoved,
    UserBanned: m.logging.eventUserBanned,
    UserUnbanned: m.logging.eventUserUnbanned,
    UserMuted: m.logging.eventUserMuted,
    UserTimedOut: m.logging.eventUserTimedOut,
    UserTimeoutRemoved: m.logging.eventUserTimeoutRemoved,
    AutoModRuleChanged: m.logging.eventAutoModRuleChanged,
    VoicePresence: m.logging.eventVoicePresence,
    VoicePresenceTts: m.logging.eventVoicePresenceTts,
    StageChanged: m.logging.eventStageChanged,
    ChannelCreated: m.logging.eventChannelCreated,
    ChannelUpdated: m.logging.eventChannelUpdated,
    ChannelDestroyed: m.logging.eventChannelDestroyed,
    ChannelPermissionsUpdated: m.logging.eventChannelPermissionsUpdated,
    ThreadCreated: m.logging.eventThreadCreated,
    ThreadUpdated: m.logging.eventThreadUpdated,
    ThreadDeleted: m.logging.eventThreadDeleted,
    ThreadMemberChanged: m.logging.eventThreadMemberChanged,
    RoleCreated: m.logging.eventRoleCreated,
    RoleUpdated: m.logging.eventRoleUpdated,
    RoleDeleted: m.logging.eventRoleDeleted,
    ServerUpdated: m.logging.eventServerUpdated,
    ServerBoosted: m.logging.eventServerBoosted,
    EventCreated: m.logging.eventEventCreated,
    ScheduledEventChanged: m.logging.eventScheduledEventChanged,
    InviteCreated: m.logging.eventInviteCreated,
    InviteDeleted: m.logging.eventInviteDeleted,
    EmojiCreated: m.logging.eventEmojiCreated,
    EmojiUpdated: m.logging.eventEmojiUpdated,
    EmojiDeleted: m.logging.eventEmojiDeleted,
    StickerCreated: m.logging.eventStickerCreated,
    StickerUpdated: m.logging.eventStickerUpdated,
    StickerDeleted: m.logging.eventStickerDeleted,
    SoundboardChanged: m.logging.eventSoundboardChanged,
    IntegrationChanged: m.logging.eventIntegrationChanged,
    WebhookChanged: m.logging.eventWebhookChanged,
    Other: m.common.other
  };
  return names[type]();
}

export function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
