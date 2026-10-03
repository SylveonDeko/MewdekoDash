import { apiRequest } from "../core";
import type {
  Achievement,
  AchievementCard,
  AchievementCardPreview,
  AchievementCardTemplate,
  AchievementCatalog,
  AchievementCategory,
  AchievementGlyph,
  AchievementIconUpload,
  AchievementImagePreviewRequest,
  AchievementLookups,
  AchievementMe,
  AchievementMemberDetail,
  AchievementMembersPage,
  AchievementOverrideRequest,
  AchievementOverview,
  AchievementSettings,
  AchievementSettingsRequest,
  AchievementUserSettings,
  CustomAchievementRequest,
} from "./models";

/**
 * Achievements API
 * Maps to Mewdeko.Controllers.AchievementsController and Mewdeko.Controllers.AchievementsMeController
 */
export const achievementsApi = {
  /**
   * Settings, data sources, totals, and recent unlocks
   * @param guildId The guild ID
   */
  overview: (guildId: bigint) =>
    apiRequest<AchievementOverview>(`achievements/${guildId}`),

  /**
   * Changes settings; missing fields stay as they are
   * @param guildId The guild ID
   * @param request The changes
   */
  updateSettings: (guildId: bigint, request: AchievementSettingsRequest) =>
    apiRequest<AchievementSettings>(`achievements/${guildId}/settings`, "PUT", request),

  /**
   * Every achievement and category, with grades, metrics, ranks, placeholders, and limits
   * @param guildId The guild ID
   */
  catalog: (guildId: bigint) =>
    apiRequest<AchievementCatalog>(`achievements/${guildId}/catalog`),

  /**
   * Channels, roles, and emojis for editors
   * @param guildId The guild ID
   */
  lookups: (guildId: bigint) =>
    apiRequest<AchievementLookups>(`achievements/${guildId}/lookups`),

  /**
   * Saves changes to a built in achievement
   * @param guildId The guild ID
   * @param key The built in key
   * @param request The changes
   */
  saveBuiltIn: (guildId: bigint, key: string, request: AchievementOverrideRequest) =>
    apiRequest<Achievement>(`achievements/${guildId}/builtin/${encodeURIComponent(key)}`, "PUT", request),

  /**
   * Puts a built in achievement back to its default
   * @param guildId The guild ID
   * @param key The built in key
   */
  resetBuiltIn: (guildId: bigint, key: string) =>
    apiRequest<Achievement>(`achievements/${guildId}/builtin/${encodeURIComponent(key)}`, "DELETE"),

  /**
   * Turns many achievements on or off
   * @param guildId The guild ID
   * @param keys Achievement keys
   * @param enabled The new state
   */
  setEnabled: (guildId: bigint, keys: string[], enabled: boolean) =>
    apiRequest<{ changed: number }>(`achievements/${guildId}/enabled`, "PUT", { keys, enabled }),

  /**
   * Creates a server made achievement
   * @param guildId The guild ID
   * @param request The achievement
   */
  createCustom: (guildId: bigint, request: CustomAchievementRequest) =>
    apiRequest<Achievement>(`achievements/${guildId}/custom`, "POST", request),

  /**
   * Replaces a server made achievement
   * @param guildId The guild ID
   * @param id The achievement ID
   * @param request The new state
   */
  updateCustom: (guildId: bigint, id: number, request: CustomAchievementRequest) =>
    apiRequest<Achievement>(`achievements/${guildId}/custom/${id}`, "PUT", request),

  /**
   * Deletes a server made achievement and every unlock of it
   * @param guildId The guild ID
   * @param id The achievement ID
   */
  deleteCustom: (guildId: bigint, id: number) =>
    apiRequest<void>(`achievements/${guildId}/custom/${id}`, "DELETE"),

  /**
   * Sets the order of the server's own achievements
   * @param guildId The guild ID
   * @param ids Achievement IDs in order
   */
  reorderCustom: (guildId: bigint, ids: number[]) =>
    apiRequest<void>(`achievements/${guildId}/custom/order`, "PUT", { ids }),

  /**
   * Creates a category
   * @param guildId The guild ID
   * @param name Name
   * @param description Description
   * @param icon Icon, or null for the folder
   */
  createCategory: (guildId: bigint, name: string, description: string | null, icon: string | null) =>
    apiRequest<AchievementCategory>(`achievements/${guildId}/categories`, "POST", { name, description, icon }),

  /**
   * Renames a category
   * @param guildId The guild ID
   * @param id The category ID
   * @param name Name
   * @param description Description
   * @param icon Icon, or null for the folder
   */
  updateCategory: (guildId: bigint, id: number, name: string, description: string | null, icon: string | null) =>
    apiRequest<AchievementCategory>(`achievements/${guildId}/categories/${id}`, "PUT", { name, description, icon }),

  /**
   * Every Font Awesome glyph the icon picker offers
   * @param guildId The guild ID
   */
  glyphs: (guildId: bigint) =>
    apiRequest<AchievementGlyph[]>(`achievements/${guildId}/glyphs`),

  /**
   * Uploads an image to use as an icon
   * @param guildId The guild ID
   * @param data The image as a data URI
   */
  uploadIcon: (guildId: bigint, data: string) =>
    apiRequest<AchievementIconUpload>(`achievements/${guildId}/icons`, "POST", { data }),

  /**
   * Deletes an uploaded icon; anything using it goes back to its default
   * @param guildId The guild ID
   * @param id The upload ID
   */
  deleteIcon: (guildId: bigint, id: number) =>
    apiRequest<void>(`achievements/${guildId}/icons/${id}`, "DELETE"),

  /**
   * Draws an achievement as a member sees it
   * @param guildId The guild ID
   * @param key The achievement key
   * @param userId The member, or the dashboard user when missing
   */
  image: (guildId: bigint, key: string, userId?: string) =>
    apiRequest<{ image: string }>(
      `achievements/${guildId}/image?key=${encodeURIComponent(key)}${userId ? `&userId=${userId}` : ""}`,
    ),

  /**
   * Draws an achievement as the editor has it, before saving
   * @param guildId The guild ID
   * @param draft The achievement as edited
   */
  previewImage: (guildId: bigint, draft: AchievementImagePreviewRequest) =>
    apiRequest<{ image: string }>(`achievements/${guildId}/image/preview`, "POST", draft),

  /**
   * Deletes a category, moving its achievements to the server category
   * @param guildId The guild ID
   * @param id The category ID
   */
  deleteCategory: (guildId: bigint, id: number) =>
    apiRequest<void>(`achievements/${guildId}/categories/${id}`, "DELETE"),

  /**
   * Saves category order and which categories are off
   * @param guildId The guild ID
   * @param order Category keys in order
   * @param disabled Category keys turned off
   */
  setCategoryLayout: (guildId: bigint, order: string[], disabled: string[]) =>
    apiRequest<AchievementCategory[]>(`achievements/${guildId}/categories/layout`, "PUT", { order, disabled }),

  /**
   * A page of members ranked by achievements
   * @param guildId The guild ID
   * @param search Name filter
   * @param page 0 based page
   * @param pageSize Rows per page
   * @param sort 0 points, 1 unlocked, 2 recent
   */
  members: (guildId: bigint, search: string, page: number, pageSize: number, sort: number) =>
    apiRequest<AchievementMembersPage>(
      `achievements/${guildId}/members?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}&sort=${sort}`,
    ),

  /**
   * One member's progress, badges, and totals
   * @param guildId The guild ID
   * @param userId The member
   */
  member: (guildId: bigint, userId: bigint | string) =>
    apiRequest<AchievementMemberDetail>(`achievements/${guildId}/members/${userId}`),

  /**
   * Hands an achievement to a member
   * @param guildId The guild ID
   * @param userId The member
   * @param key The achievement key
   */
  grant: (guildId: bigint, userId: bigint | string, key: string) =>
    apiRequest<AchievementMemberDetail>(`achievements/${guildId}/members/${userId}/grant`, "POST", { key }),

  /**
   * Takes an achievement from a member
   * @param guildId The guild ID
   * @param userId The member
   * @param key The achievement key
   */
  revoke: (guildId: bigint, userId: bigint | string, key: string) =>
    apiRequest<AchievementMemberDetail>(
      `achievements/${guildId}/members/${userId}/achievements/${encodeURIComponent(key)}`, "DELETE"),

  /**
   * Clears every achievement a member has
   * @param guildId The guild ID
   * @param userId The member
   */
  resetMember: (guildId: bigint, userId: bigint | string) =>
    apiRequest<{ cleared: number }>(`achievements/${guildId}/members/${userId}/reset`, "POST"),

  /**
   * Clears every achievement in the server
   * @param guildId The guild ID
   */
  resetGuild: (guildId: bigint) =>
    apiRequest<{ cleared: number }>(`achievements/${guildId}/reset`, "POST"),

  /**
   * Checks every member again soon, quietly
   * @param guildId The guild ID
   */
  recheck: (guildId: bigint) =>
    apiRequest<void>(`achievements/${guildId}/recheck`, "POST"),

  /**
   * Turns on message counting so message achievements can track
   * @param guildId The guild ID
   */
  enableMessageCounting: (guildId: bigint) =>
    apiRequest<Record<string, boolean>>(`achievements/${guildId}/data-sources/messages`, "POST"),

  /**
   * The signed in member's own achievements in a server
   * @param guildId The guild ID
   * @param userId The signed in member
   */
  me: (guildId: bigint | string, userId: bigint | string) =>
    apiRequest<AchievementMe>(`me/${guildId}/${userId}/achievements`),

  /**
   * Changes the signed in member's privacy and notification preferences
   * @param guildId The guild ID
   * @param userId The signed in member
   * @param request The changes
   */
  updateMySettings: (guildId: bigint | string, userId: bigint | string, request: Partial<AchievementUserSettings>) =>
    apiRequest<AchievementUserSettings>(`me/${guildId}/${userId}/achievements/settings`, "PUT", request),

  /**
   * Replaces the signed in member's four badge slots
   * @param guildId The guild ID
   * @param userId The signed in member
   * @param slots Badge keys for slots 1 to 4, null for empty
   */
  setMyBadges: (guildId: bigint | string, userId: bigint | string, slots: (string | null)[]) =>
    apiRequest<{ equipped: (string | null)[] }>(`me/${guildId}/${userId}/achievements/badges`, "PUT", { slots }),

  /**
   * The server's card designs, its default, what uses which, card images, and the bot's palette
   * @param guildId The guild ID
   */
  card: (guildId: bigint) =>
    apiRequest<AchievementCard>(`achievements/${guildId}/card`),

  /**
   * Saves a new card design
   * @param guildId The guild ID
   * @param name Its name
   * @param template The design
   * @param makeDefault Whether it also becomes the server default
   */
  createCardDesign: (guildId: bigint, name: string, template: AchievementCardTemplate, makeDefault = false) =>
    apiRequest<AchievementCard>(`achievements/${guildId}/card/designs`, "POST", { name, template, makeDefault }),

  /**
   * Renames or changes a saved card design
   * @param guildId The guild ID
   * @param id The design ID
   * @param changes A new name, design, or both
   */
  updateCardDesign: (guildId: bigint, id: number, changes: { name?: string; template?: AchievementCardTemplate }) =>
    apiRequest<AchievementCard>(`achievements/${guildId}/card/designs/${id}`, "PUT", changes),

  /**
   * Deletes a saved card design; anything using it falls back
   * @param guildId The guild ID
   * @param id The design ID
   */
  deleteCardDesign: (guildId: bigint, id: number) =>
    apiRequest<AchievementCard>(`achievements/${guildId}/card/designs/${id}`, "DELETE"),

  /**
   * Sets the design every achievement uses by default
   * @param guildId The guild ID
   * @param id The design ID, or null for the built in one
   */
  setDefaultCard: (guildId: bigint, id: number | null) =>
    apiRequest<AchievementCard>(`achievements/${guildId}/card/default`, "PUT", { id }),

  /**
   * Sets the design a category or achievement uses instead of the default
   * @param guildId The guild ID
   * @param category True for a category key, false for an achievement key
   * @param key The category or achievement key
   * @param id The design ID, or null to follow the default again
   */
  assignCard: (guildId: bigint, category: boolean, key: string, id: number | null) =>
    apiRequest<AchievementCard>(`achievements/${guildId}/card/assign`, "PUT", { category, key, id }),

  /**
   * Draws a card design before saving, with where each element landed
   * @param guildId The guild ID
   * @param template The design as edited, or null to draw designId or the achievement's own design
   * @param locked Whether to draw the locked state
   * @param key The achievement to show, or a sample when missing
   * @param designId A saved design to draw when template is null
   */
  previewCard: (guildId: bigint, template: AchievementCardTemplate | null, locked: boolean, key?: string | null,
    designId?: number | null) =>
    apiRequest<AchievementCardPreview>(`achievements/${guildId}/card/preview`, "POST",
      { template, locked, key, designId }),

  /**
   * Uploads an image for the card designer; delete it with deleteIcon
   * @param guildId The guild ID
   * @param data The image as a data URI
   */
  uploadCardImage: (guildId: bigint, data: string) =>
    apiRequest<AchievementIconUpload>(`achievements/${guildId}/card/images`, "POST", { data }),
};
