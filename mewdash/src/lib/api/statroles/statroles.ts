// lib/api/statroles/statroles.ts
import { apiRequest } from "../core";
import type { StatRole, StatRoleRequest, StatRoleRunResult } from "./models";

/**
 * Stat roles API
 * Maps to Mewdeko.Controllers.StatRolesController
 */
export const statRolesApi = {
  /** Lists stat roles */
  list: (guildId: bigint) => apiRequest<StatRole[]>(`StatRoles/${guildId}`),

  /** Gets one stat role */
  get: (guildId: bigint, id: number) => apiRequest<StatRole>(`StatRoles/${guildId}/${id}`),

  /** Creates a stat role */
  create: (guildId: bigint, request: StatRoleRequest) =>
    apiRequest<StatRole>(`StatRoles/${guildId}`, "POST", request),

  /** Updates a stat role */
  update: (guildId: bigint, id: number, request: StatRoleRequest) =>
    apiRequest<StatRole>(`StatRoles/${guildId}/${id}`, "PUT", request),

  /** Deletes a stat role */
  remove: (guildId: bigint, id: number) => apiRequest<boolean>(`StatRoles/${guildId}/${id}`, "DELETE"),

  /** Previews who would gain and lose the role */
  preview: (guildId: bigint, id: number) =>
    apiRequest<StatRoleRunResult>(`StatRoles/${guildId}/${id}/preview`, "POST"),

  /** Evaluates and applies the role now */
  run: (guildId: bigint, id: number) => apiRequest<StatRoleRunResult>(`StatRoles/${guildId}/${id}/run`, "POST"),
};
