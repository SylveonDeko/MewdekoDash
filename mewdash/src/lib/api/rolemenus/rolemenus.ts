import { apiRequest } from "../core";
import type {
  RoleMenu,
  RoleMenuImportRequest,
  RoleMenuImportSource,
  RoleMenuLookups,
  RoleMenuRequest,
} from "./models";

/**
 * Role Menus API
 * Maps to Mewdeko.Controllers.RoleMenusController
 */
export const roleMenusApi = {
  /**
   * Lists a guild's role menus, ordered by ID
   * @param guildId The guild ID
   */
  list: (guildId: bigint) =>
    apiRequest<RoleMenu[]>(`rolemenus/${guildId}`),

  /**
   * Gets one role menu
   * @param guildId The guild ID
   * @param menuId The menu ID
   */
  get: (guildId: bigint, menuId: number) =>
    apiRequest<RoleMenu>(`rolemenus/${guildId}/${menuId}`),

  /**
   * Creates a menu and posts its message
   * @param guildId The guild ID
   * @param request The menu to create
   * @returns The created menu
   */
  create: (guildId: bigint, request: RoleMenuRequest) =>
    apiRequest<RoleMenu>(`rolemenus/${guildId}`, "POST", request),

  /**
   * Replaces a menu and rebuilds its message in place
   * @param guildId The guild ID
   * @param menuId The menu ID
   * @param request The full desired state
   * @returns The updated menu
   */
  update: (guildId: bigint, menuId: number, request: RoleMenuRequest) =>
    apiRequest<RoleMenu>(`rolemenus/${guildId}/${menuId}`, "PUT", request),

  /**
   * Deletes a menu and its message
   * @param guildId The guild ID
   * @param menuId The menu ID
   */
  remove: (guildId: bigint, menuId: number) =>
    apiRequest<void>(`rolemenus/${guildId}/${menuId}`, "DELETE"),

  /**
   * Pauses or resumes a menu
   * @param guildId The guild ID
   * @param menuId The menu ID
   * @param enabled False to pause, true to resume
   * @returns The updated menu
   */
  setEnabled: (guildId: bigint, menuId: number, enabled: boolean) =>
    apiRequest<RoleMenu>(`rolemenus/${guildId}/${menuId}/enabled`, "PUT", { enabled }),

  /**
   * Reorders a menu's options
   * @param guildId The guild ID
   * @param menuId The menu ID
   * @param optionIds Every option ID exactly once, in the new order
   * @returns The updated menu
   */
  reorder: (guildId: bigint, menuId: number, optionIds: number[]) =>
    apiRequest<RoleMenu>(`rolemenus/${guildId}/${menuId}/order`, "PUT", { optionIds }),

  /**
   * Posts a fresh copy of a menu and deletes the old message
   * @param guildId The guild ID
   * @param menuId The menu ID
   * @param channelId Where to post it, or null for the menu's current channel
   * @returns The updated menu
   */
  repost: (guildId: bigint, menuId: number, channelId: bigint | null = null) =>
    apiRequest<RoleMenu>(`rolemenus/${guildId}/${menuId}/repost`, "POST", { channelId }),

  /**
   * Gets the channels, roles, emojis, and limits the editor needs
   * @param guildId The guild ID
   */
  lookups: (guildId: bigint) =>
    apiRequest<RoleMenuLookups>(`rolemenus/${guildId}/lookups`),

  /**
   * Lists the older emoji role setups that can be moved into role menus
   * @param guildId The guild ID
   */
  importSources: (guildId: bigint) =>
    apiRequest<RoleMenuImportSource[]>(`rolemenus/${guildId}/import-sources`),

  /**
   * Moves an older emoji role setup into a new role menu
   * @param guildId The guild ID
   * @param request Import settings
   * @returns The created menu
   */
  importSetup: (guildId: bigint, request: RoleMenuImportRequest) =>
    apiRequest<RoleMenu>(`rolemenus/${guildId}/import`, "POST", request),
};
