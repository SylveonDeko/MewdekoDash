import type {
  CustomVoiceConfigurationRequest,
  CustomVoiceConfigurationResponse
} from "$lib/api/index.ts";

export type Named = { id: string; name: string; color?: number };

export const DEFAULT_NAME_FORMAT = "{username}'s Channel";

export const SyncMode = { None: 0, Hub: 1, Category: 2 } as const;

export interface Hub {
  hubId: string;
  hubName: string;
  categoryId: string | null;
  defaultNameFormat: string;
  defaultUserLimit: number;
  defaultBitrate: number;
  deleteWhenEmpty: boolean;
  emptyChannelTimeout: number;
  cleanupLeftovers: boolean;
  allowMultipleChannels: boolean;
  createTextChannel: boolean;
  ownerLockMinutes: number;
  allowNameCustomization: boolean;
  allowUserLimitCustomization: boolean;
  allowBitrateCustomization: boolean;
  allowLocking: boolean;
  allowUserManagement: boolean;
  persistUserPreferences: boolean;
  maxUserLimit: number;
  maxBitrate: number;
  autoPermission: boolean;
  ownerManageChannel: boolean;
  ownerManageRoles: boolean;
  ownerMoveMembers: boolean;
  ownerPrioritySpeaker: boolean;
  syncPermissions: number;
  adminRoleId: string | null;
  moderatorRoleIds: string[];
}

export type BoolKey = {
  [K in keyof Hub]: Hub[K] extends boolean ? K : never;
}[keyof Hub];

export const NEW_HUB_DEFAULTS: Omit<Hub, "hubId" | "categoryId" | "hubName"> = {
  defaultNameFormat: DEFAULT_NAME_FORMAT,
  defaultUserLimit: 0,
  defaultBitrate: 64,
  deleteWhenEmpty: true,
  emptyChannelTimeout: 1,
  cleanupLeftovers: true,
  allowMultipleChannels: false,
  createTextChannel: false,
  ownerLockMinutes: 0,
  allowNameCustomization: true,
  allowUserLimitCustomization: true,
  allowBitrateCustomization: true,
  allowLocking: true,
  allowUserManagement: true,
  persistUserPreferences: true,
  maxUserLimit: 99,
  maxBitrate: 96,
  autoPermission: true,
  ownerManageChannel: true,
  ownerManageRoles: false,
  ownerMoveMembers: true,
  ownerPrioritySpeaker: false,
  syncPermissions: SyncMode.None,
  adminRoleId: null,
  moderatorRoleIds: []
};

/**
 * Turns an id the API returned, which may be a big number object, into a string.
 * @param value The id
 */
export function idString(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

/**
 * Reads a hub the bot sent.
 * @param r The bot's response
 */
export function hubFromResponse(r: CustomVoiceConfigurationResponse): Hub {
  const d = NEW_HUB_DEFAULTS;
  return {
    hubId: idString(r.hubVoiceChannelId),
    hubName: r.hubName ?? "",
    categoryId: r.channelCategoryId ? idString(r.channelCategoryId) : null,
    defaultNameFormat: r.defaultNameFormat || d.defaultNameFormat,
    defaultUserLimit: r.defaultUserLimit ?? d.defaultUserLimit,
    defaultBitrate: r.defaultBitrate || d.defaultBitrate,
    deleteWhenEmpty: r.deleteWhenEmpty ?? d.deleteWhenEmpty,
    emptyChannelTimeout: r.emptyChannelTimeout ?? d.emptyChannelTimeout,
    cleanupLeftovers: r.cleanupLeftovers ?? d.cleanupLeftovers,
    allowMultipleChannels: r.allowMultipleChannels ?? d.allowMultipleChannels,
    createTextChannel: r.createTextChannel ?? d.createTextChannel,
    ownerLockMinutes: r.ownerLockMinutes ?? d.ownerLockMinutes,
    allowNameCustomization: r.allowNameCustomization ?? d.allowNameCustomization,
    allowUserLimitCustomization: r.allowUserLimitCustomization ?? d.allowUserLimitCustomization,
    allowBitrateCustomization: r.allowBitrateCustomization ?? d.allowBitrateCustomization,
    allowLocking: r.allowLocking ?? d.allowLocking,
    allowUserManagement: r.allowUserManagement ?? d.allowUserManagement,
    persistUserPreferences: r.persistUserPreferences ?? d.persistUserPreferences,
    maxUserLimit: r.maxUserLimit || d.maxUserLimit,
    maxBitrate: r.maxBitrate || d.maxBitrate,
    autoPermission: r.autoPermission ?? d.autoPermission,
    ownerManageChannel: r.ownerManageChannel ?? d.ownerManageChannel,
    ownerManageRoles: r.ownerManageRoles ?? d.ownerManageRoles,
    ownerMoveMembers: r.ownerMoveMembers ?? d.ownerMoveMembers,
    ownerPrioritySpeaker: r.ownerPrioritySpeaker ?? d.ownerPrioritySpeaker,
    syncPermissions: r.syncPermissions ?? d.syncPermissions,
    adminRoleId: r.customVoiceAdminRoleId ? idString(r.customVoiceAdminRoleId) : null,
    moderatorRoleIds: (r.moderatorRoleIds ?? []).map(idString)
  };
}

/**
 * Builds the bot's save request for a hub.
 * @param h The hub
 */
export function hubToRequest(h: Hub): CustomVoiceConfigurationRequest {
  return {
    hubVoiceChannelId: BigInt(h.hubId),
    channelCategoryId: h.categoryId ? BigInt(h.categoryId) : null,
    defaultNameFormat: h.defaultNameFormat.trim() || DEFAULT_NAME_FORMAT,
    defaultUserLimit: h.defaultUserLimit,
    defaultBitrate: h.defaultBitrate,
    deleteWhenEmpty: h.deleteWhenEmpty,
    emptyChannelTimeout: h.emptyChannelTimeout,
    allowMultipleChannels: h.allowMultipleChannels,
    allowNameCustomization: h.allowNameCustomization,
    allowUserLimitCustomization: h.allowUserLimitCustomization,
    allowBitrateCustomization: h.allowBitrateCustomization,
    allowLocking: h.allowLocking,
    allowUserManagement: h.allowUserManagement,
    maxUserLimit: h.maxUserLimit,
    maxBitrate: h.maxBitrate,
    persistUserPreferences: h.persistUserPreferences,
    autoPermission: h.autoPermission,
    createTextChannel: h.createTextChannel,
    customVoiceAdminRoleId: h.adminRoleId ? BigInt(h.adminRoleId) : null,
    hubName: h.hubName.trim(),
    ownerLockMinutes: h.ownerLockMinutes,
    ownerManageChannel: h.ownerManageChannel,
    ownerManageRoles: h.ownerManageRoles,
    ownerMoveMembers: h.ownerMoveMembers,
    ownerPrioritySpeaker: h.ownerPrioritySpeaker,
    syncPermissions: h.syncPermissions,
    moderatorRoleIds: h.moderatorRoleIds.map((id) => BigInt(id)),
    cleanupLeftovers: h.cleanupLeftovers
  };
}

/**
 * Reads an error's own message, which is the bot's when it gave one.
 * @param err The thrown value
 * @param fallback What to say when there is no message
 */
export function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

/**
 * Formats a bot timestamp, which is UTC without a zone, for a list row.
 * @param value An ISO date string
 */
export function formatDate(value: string): string {
  const date = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}
