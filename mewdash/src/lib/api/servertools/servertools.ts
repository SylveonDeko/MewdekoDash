// lib/api/servertools/servertools.ts
import { apiRequest } from "../core";

type Id = bigint | string;

/** Maps to Mewdeko.Controllers.Common.ServerBackups.ServerBackupDto */
export interface ServerBackup {
  id: number;
  sourceGuildId: Id;
  sourceGuildName: string;
  sizeBytes: number;
  roleCount: number;
  channelCount: number;
  emojiCount: number;
  messageCount: number;
  createdAt: string;
}

/** Maps to Mewdeko.Controllers.Common.ServerBackups.ServerBackupListResponse */
export interface ServerBackupList {
  maxBackups: number;
  cooldownMinutes: number;
  backups: ServerBackup[];
}

/** Maps to Mewdeko.Controllers.Common.ServerBackups.BackupPreviewDto */
export interface BackupPreview {
  name: string;
  roles: Array<{ name: string; color: number }>;
  channels: Array<{ name: string; type: string; category: string | null }>;
  emojiCount: number;
  messageCount: number;
}

export type RestoreMode = "Replace" | "AddMissing";

/** Maps to Mewdeko.Controllers.Common.ServerBackups.RestoreStatusDto */
export interface RestoreStatus {
  started: boolean;
  finished: boolean;
  step: string;
  rolesCreated: number;
  channelsCreated: number;
  emojisCreated: number;
  messagesRestored: number;
  failures: string[];
}

/** Maps to Mewdeko.Controllers.Common.ServerTemplates.ServerTemplateDto */
export interface ServerTemplate {
  name: string;
  sizeBytes: number;
  roleCount: number;
  channelCount: number;
  createdAt: string;
}

export interface ServerTemplateList {
  builtIn: string[];
  templates: ServerTemplate[];
}

export type LockdownType = "Joins" | "Readonly" | "Full";

export interface LockdownStatus {
  type: "None" | LockdownType;
  action: string | null;
}

export type PurgeFilter = "All" | "Humans" | "Bots" | "Links" | "Attachments";

/** Maps to Mewdeko.Controllers.Common.ChannelTools.AutoPurgeDto */
export interface AutoPurge {
  channelId: Id;
  maxAgeMinutes: number;
  intervalMinutes: number;
  filter: PurgeFilter;
  keepPinned: boolean;
  lastRunAt: string | null;
}

export interface VoiceTextLink {
  voiceChannelId: Id;
  textChannelId: Id;
}

export type TimedKind = "Lock" | "Hide";

export interface ChannelTimedAction {
  channelId: Id;
  kind: TimedKind;
  endsAt: string | null;
  createdBy: Id;
}

export interface BulkResult {
  succeeded: number;
  failed: number;
}

export interface GuildChannelLite {
  id: string;
  name: string;
  type: "text" | "voice" | "stage" | "announcement" | "forum" | "category";
  categoryId: string | null;
  categoryName: string | null;
  position: number;
}

export const guildChannelsApi = {
  list: (guildId: bigint) => apiRequest<GuildChannelLite[]>(`ClientOperations/guildchannels/${guildId}`)
};

export const serverBackupsApi = {
  list: (userId: bigint | string) => apiRequest<ServerBackupList>(`ServerBackups/${userId}`),

  preview: (userId: bigint | string, id: number) =>
    apiRequest<BackupPreview>(`ServerBackups/${userId}/${id}`),

  create: (userId: bigint | string, guildId: bigint, body: { messages: number; channelIds: bigint[] }) =>
    apiRequest<ServerBackup>(`ServerBackups/${userId}/create/${guildId}`, "POST", body),

  restore: (userId: bigint | string, id: number, guildId: bigint, mode: RestoreMode) =>
    apiRequest<void>(`ServerBackups/${userId}/${id}/restore/${guildId}`, "POST", { mode }),

  restoreStatus: (userId: bigint | string, guildId: bigint) =>
    apiRequest<RestoreStatus>(`ServerBackups/${userId}/restore/${guildId}`),

  remove: (userId: bigint | string, id: number) =>
    apiRequest<void>(`ServerBackups/${userId}/${id}`, "DELETE")
};

export const serverTemplatesApi = {
  list: (userId: bigint | string) => apiRequest<ServerTemplateList>(`ServerTemplates/${userId}`),

  preview: (userId: bigint | string, name: string) =>
    apiRequest<BackupPreview>(`ServerTemplates/${userId}/${encodeURIComponent(name)}`),

  save: (userId: bigint | string, guildId: bigint, name: string) =>
    apiRequest<ServerTemplate>(`ServerTemplates/${userId}/save/${guildId}`, "POST", { name }),

  apply: (userId: bigint | string, guildId: bigint, name: string) =>
    apiRequest<void>(`ServerTemplates/${userId}/apply/${guildId}/${encodeURIComponent(name)}`, "POST"),

  remove: (userId: bigint | string, name: string) =>
    apiRequest<void>(`ServerTemplates/${userId}/${encodeURIComponent(name)}`, "DELETE")
};

export const channelActionsApi = {
  getLockdown: (guildId: bigint) => apiRequest<LockdownStatus>(`ChannelActions/${guildId}/lockdown`),

  startLockdown: (guildId: bigint, body: { type: LockdownType; action: string; override?: boolean }) =>
    apiRequest<LockdownStatus>(`ChannelActions/${guildId}/lockdown`, "POST", body),

  liftLockdown: (guildId: bigint) => apiRequest<LockdownStatus>(`ChannelActions/${guildId}/lockdown`, "DELETE"),

  slowmode: (guildId: bigint, body: { channelIds: bigint[]; seconds: number }) =>
    apiRequest<BulkResult>(`ChannelActions/${guildId}/slowmode`, "POST", body),

  lock: (guildId: bigint, body: { userId: bigint | string; channelIds: bigint[]; kind: TimedKind; minutes: number | null }) =>
    apiRequest<BulkResult>(`ChannelActions/${guildId}/lock`, "POST", body),

  unlock: (guildId: bigint, body: { channelIds: bigint[]; kind: TimedKind }) =>
    apiRequest<BulkResult>(`ChannelActions/${guildId}/unlock`, "POST", body),

  sync: (guildId: bigint, channelIds: bigint[]) =>
    apiRequest<BulkResult>(`ChannelActions/${guildId}/sync`, "POST", { channelIds }),

  clone: (guildId: bigint, body: { channelId: bigint; name: string | null }) =>
    apiRequest<{ id: Id; name: string }>(`ChannelActions/${guildId}/clone`, "POST", body),

  nuke: (guildId: bigint, channelId: bigint) =>
    apiRequest<{ id: Id; name: string }>(`ChannelActions/${guildId}/nuke`, "POST", { channelId }),

  purge: (guildId: bigint, body: { channelId: bigint; amount: number; filter: PurgeFilter; keepPinned: boolean }) =>
    apiRequest<void>(`ChannelActions/${guildId}/purge`, "POST", body)
};

export const channelToolsApi = {
  getAutoPurge: (guildId: bigint) => apiRequest<AutoPurge[]>(`ChannelTools/${guildId}/autopurge`),

  setAutoPurge: (guildId: bigint, body: Omit<AutoPurge, "lastRunAt">) =>
    apiRequest<AutoPurge>(`ChannelTools/${guildId}/autopurge`, "POST", body),

  removeAutoPurge: (guildId: bigint, channelId: Id) =>
    apiRequest<void>(`ChannelTools/${guildId}/autopurge/${channelId}`, "DELETE"),

  runAutoPurge: (guildId: bigint, channelId: Id) =>
    apiRequest<number>(`ChannelTools/${guildId}/autopurge/${channelId}/run`, "POST"),

  getVoiceText: (guildId: bigint) => apiRequest<VoiceTextLink[]>(`ChannelTools/${guildId}/voicetext`),

  setVoiceText: (guildId: bigint, body: { voiceChannelId: bigint; textChannelId: bigint }) =>
    apiRequest<VoiceTextLink>(`ChannelTools/${guildId}/voicetext`, "POST", body),

  removeVoiceText: (guildId: bigint, voiceChannelId: Id) =>
    apiRequest<void>(`ChannelTools/${guildId}/voicetext/${voiceChannelId}`, "DELETE"),

  getLocks: (guildId: bigint) => apiRequest<ChannelTimedAction[]>(`ChannelTools/${guildId}/locks`)
};

export const lockdownApi = {
  getExemptions: (guildId: bigint) =>
    apiRequest<{ lockedDown: boolean; channelIds: Id[] }>(`Lockdown/${guildId}/exemptions`),

  setExemptions: (guildId: bigint, channelIds: bigint[]) =>
    apiRequest<{ lockedDown: boolean; channelIds: Id[] }>(`Lockdown/${guildId}/exemptions`, "PUT", { channelIds })
};
