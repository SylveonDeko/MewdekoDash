import { StatRoleLimit, StatRoleStat, type StatRole, type StatRoleRequest } from "$lib/api/index.ts";

export interface Draft {
  id: number | null;
  roleId: string | null;
  name: string;
  statType: number;
  limitType: number;
  minimum: number;
  maximum: number | null;
  lookbackDays: number;
  topStart: number;
  topEnd: number;
  requiredDays: number;
  permanent: boolean;
  invert: boolean;
  applyToBots: boolean;
  groupName: string;
  activityName: string;
  channelFilter: string[];
  roleWhitelist: string[];
  roleBlacklist: string[];
  ignoredUsers: string[];
  notifyChannelId: string | null;
  notifyDm: boolean;
  notifyMessage: string;
  intervalMinutes: number;
}

export interface Option {
  id: string;
  name: string;
  color?: number;
  avatarUrl?: string;
}

export function emptyDraft(): Draft {
  return {
    id: null,
    roleId: null,
    name: "",
    statType: StatRoleStat.Messages,
    limitType: StatRoleLimit.Threshold,
    minimum: 100,
    maximum: null,
    lookbackDays: 30,
    topStart: 1,
    topEnd: 10,
    requiredDays: 5,
    permanent: false,
    invert: false,
    applyToBots: false,
    groupName: "",
    activityName: "",
    channelFilter: [],
    roleWhitelist: [],
    roleBlacklist: [],
    ignoredUsers: [],
    notifyChannelId: null,
    notifyDm: false,
    notifyMessage: "",
    intervalMinutes: 180
  };
}

export function draftFrom(role: StatRole): Draft {
  return {
    id: role.id,
    roleId: role.roleId.toString(),
    name: role.name,
    statType: role.statType,
    limitType: role.limitType,
    minimum: role.minimum,
    maximum: role.maximum ?? null,
    lookbackDays: role.lookbackDays,
    topStart: role.topStart,
    topEnd: role.topEnd,
    requiredDays: role.requiredDays,
    permanent: role.permanent,
    invert: role.invert,
    applyToBots: role.applyToBots,
    groupName: role.groupName ?? "",
    activityName: role.activityName ?? "",
    channelFilter: role.channelFilter.map((x) => x.toString()),
    roleWhitelist: role.roleWhitelist.map((x) => x.toString()),
    roleBlacklist: role.roleBlacklist.map((x) => x.toString()),
    ignoredUsers: role.ignoredUsers.map((x) => x.toString()),
    notifyChannelId: role.notifyChannelId ? role.notifyChannelId.toString() : null,
    notifyDm: role.notifyDm,
    notifyMessage: role.notifyMessage ?? "",
    intervalMinutes: role.intervalMinutes
  };
}

export function usesWindow(statType: number): boolean {
  return (
    statType === StatRoleStat.Messages ||
    statType === StatRoleStat.VoiceMinutes ||
    statType === StatRoleStat.ActivityMinutes
  );
}

export function toRequest(draft: Draft): StatRoleRequest {
  return {
    roleId: draft.roleId ? BigInt(draft.roleId) : undefined,
    name: draft.name.trim() || undefined,
    statType: draft.statType,
    limitType: draft.limitType,
    minimum: draft.minimum,
    maximum: draft.maximum ?? undefined,
    clearMaximum: draft.maximum === null,
    lookbackDays: draft.lookbackDays,
    topStart: draft.topStart,
    topEnd: draft.topEnd,
    requiredDays: draft.requiredDays,
    permanent: draft.permanent,
    invert: draft.invert,
    applyToBots: draft.applyToBots,
    groupName: draft.groupName.trim(),
    activityName: draft.activityName.trim(),
    channelFilter: draft.channelFilter.map((x) => BigInt(x)),
    roleWhitelist: draft.roleWhitelist.map((x) => BigInt(x)),
    roleBlacklist: draft.roleBlacklist.map((x) => BigInt(x)),
    ignoredUsers: draft.ignoredUsers.map((x) => BigInt(x)),
    notifyChannelId: draft.notifyChannelId ? BigInt(draft.notifyChannelId) : undefined,
    clearNotifyChannel: !draft.notifyChannelId,
    notifyDm: draft.notifyDm,
    notifyMessage: draft.notifyMessage.trim(),
    intervalMinutes: draft.intervalMinutes
  };
}

export function toList(selected: string | string[] | null): string[] {
  if (Array.isArray(selected)) return selected;
  return selected ? [selected] : [];
}
