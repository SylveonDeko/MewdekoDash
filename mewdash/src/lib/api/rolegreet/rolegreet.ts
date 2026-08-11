// lib/api/rolegreet/rolegreet.ts
import { apiRequest } from "../core";
import type { RoleGreet } from "./models";

/**
 * Role greet API
 * Maps to Mewdeko.Controllers.RoleGreetController
 */
export const roleGreetApi = {
  /**
   * Gets all role greets for a specific role
   * @param guildId The guild ID
   * @param roleId The role ID
   * @returns Collection of role greets
   */
  getGreetsForRole: (guildId: bigint, roleId: bigint) =>
    apiRequest<RoleGreet[]>(`RoleGreet/${guildId}/role/${roleId}`),

  /**
   * Gets all role greets in a guild
   * @param guildId The guild ID
   * @returns Collection of all role greets
   */
  getAllRoleGreets: (guildId: bigint) =>
    apiRequest<RoleGreet[]>(`RoleGreet/${guildId}`),

  /**
   * Adds a new role greet
   * @param guildId The guild ID
   * @param roleId The role ID
   * @param channelId The channel ID to send greets in
   */
  addRoleGreet: (guildId: bigint, roleId: bigint, channelId: bigint) =>
    apiRequest<void>(`RoleGreet/${guildId}/role/${roleId}`, "POST", channelId),

  /**
   * Deletes a role greet
   * @param guildId The guild ID
   * @param greetId The greet ID
   */
  deleteRoleGreet: (guildId: bigint, greetId: number) =>
    apiRequest<void>(`RoleGreet/${guildId}/${greetId}`, "DELETE"),

  /**
   * Updates the message for a role greet
   * @param guildId The guild ID
   * @param greetId The greet ID
   * @param message The new message
   */
  updateRoleGreetMessage: (guildId: bigint, greetId: number, message: string) =>
    apiRequest<void>(`RoleGreet/${guildId}/${greetId}/message`, "PUT", message),

  /**
   * Updates the deletion time for a role greet message
   * @param guildId The guild ID
   * @param greetId The greet ID
   * @param seconds Deletion time in seconds
   */
  updateRoleGreetDeleteTime: (
    guildId: bigint,
    greetId: number,
    seconds: number,
  ) =>
    apiRequest<void>(
      `RoleGreet/${guildId}/${greetId}/delete-time`,
      "PUT",
      seconds,
    ),

  /**
   * Updates the webhook for a role greet
   * @param guildId The guild ID
   * @param greetId The greet ID
   * @param webhookUrl The webhook URL (null to remove)
   */
  updateRoleGreetWebhook: (
    guildId: bigint,
    greetId: number,
    webhookUrl: string | null,
  ) =>
    apiRequest<void>(`RoleGreet/${guildId}/${greetId}/webhook`, "PUT", {
      webhookUrl,
    }),

  /**
   * Enables or disables greeting bots
   * @param guildId The guild ID
   * @param greetId The greet ID
   * @param enabled Whether to greet bots
   */
  updateRoleGreetBots: (guildId: bigint, greetId: number, enabled: boolean) =>
    apiRequest<void>(
      `RoleGreet/${guildId}/${greetId}/greet-bots`,
      "PUT",
      enabled,
    ),

  /**
   * Enables or disables a role greet
   * @param guildId The guild ID
   * @param greetId The greet ID
   * @param disabled Whether to disable the greet
   */
  disableRoleGreet: (guildId: bigint, greetId: number, disabled: boolean) =>
    apiRequest<void>(
      `RoleGreet/${guildId}/${greetId}/disable`,
      "PUT",
      disabled,
    ),
};
