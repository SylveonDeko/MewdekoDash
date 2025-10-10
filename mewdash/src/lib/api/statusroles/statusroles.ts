// lib/api/statusroles/statusroles.ts
import { apiRequest } from "../core";
import type { StatusRole } from "./models";

export const statusRolesApi = {
  getStatusRoles: (guildId: bigint) =>
    apiRequest<StatusRole[]>(`StatusRoles/${guildId}`),

  addStatusRole: (guildId: bigint, status: string) =>
    apiRequest<void>(`StatusRoles/${guildId}`, "POST", status),

  removeStatusRole: (guildId: bigint, id: number) =>
    apiRequest<void>(`StatusRoles/${guildId}/${id}`, "DELETE"),

  setAddRoles: (guildId: bigint, id: number, roleIds: string) =>
    apiRequest<void>(`StatusRoles/${guildId}/${id}/addRoles`, "POST", roleIds),

  setRemoveRoles: (guildId: bigint, id: number, roleIds: string) =>
    apiRequest<void>(
      `StatusRoles/${guildId}/${id}/removeRoles`,
      "POST",
      roleIds,
    ),

  setStatusChannel: (guildId: bigint, id: number, channelId: bigint) =>
    apiRequest<void>(`StatusRoles/${guildId}/${id}/channel`, "POST", channelId),

  setStatusEmbed: (guildId: bigint, id: number, embedText: string) =>
    apiRequest<void>(`StatusRoles/${guildId}/${id}/embed`, "POST", embedText),

  toggleRemoveAdded: (guildId: bigint, id: number) =>
    apiRequest<{ removeAdded: boolean }>(
      `StatusRoles/${guildId}/${id}/toggleRemoveAdded`,
      "POST",
    ),

  toggleReaddRemoved: (guildId: bigint, id: number) =>
    apiRequest<{ readdRemoved: boolean }>(
      `StatusRoles/${guildId}/${id}/toggleReaddRemoved`,
      "POST",
    ),
};
