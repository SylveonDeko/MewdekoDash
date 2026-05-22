// lib/api/ticket/ticket.ts
import { apiRequest } from "../core";
import type {
  AddButtonRequest,
  AddSelectMenuRequest,
  AddSelectOptionRequest,
  AddTagsRequest,
  BatchAddRoleRequest,
  BatchMoveTicketsRequest,
  BatchTransferTicketsRequest,
  BlacklistedUserResponse,
  BlacklistUserRequest,
  ClaimTicketRequest,
  CreateCaseRequest,
  CreatePanelRequest,
  CreatePriorityRequest,
  CreateTagRequest,
  DeleteNoteRequest,
  EditNoteRequest,
  GuildStatistics,
  PanelButton,
  PanelSelectMenu,
  PanelStatus,
  RecreateAllPanelsResponse,
  RemoveTagsRequest,
  ReorderButtonsRequest,
  SetChannelRequest,
  SetPriorityRequest,
  StaffResponseStats,
  Ticket,
  TicketActivity,
  TicketCase,
  TicketPanel,
  TicketPriority,
  TicketTag,
  UpdateButtonRequest,
  UpdateCaseRequest,
  UpdateEmbedRequest,
  UpdatePlaceholderRequest,
  UserStatistics
} from "./models";

/**
 * Ticket system API
 * Maps to Mewdeko.Controllers.TicketController
 * This is the largest controller with 58 methods
 */
export const ticketApi = {
  // ============================================
  // Panel Management
  // ============================================

  /**
   * Gets all ticket panels for a guild
   * @param guildId The guild ID
   * @returns List of ticket panels
   */
  getTicketPanels: (guildId: bigint) =>
    apiRequest<TicketPanel[]>(`ticket/${guildId}/panels`),

  /**
   * Creates a new ticket panel
   * @param guildId The guild ID
   * @param panel Panel configuration
   */
  createTicketPanel: (guildId: bigint, panel: CreatePanelRequest) =>
    apiRequest<void>(`ticket/${guildId}/panels`, "POST", panel),

  /**
   * Deletes a ticket panel
   * @param guildId The guild ID
   * @param panelId The panel ID
   * @param force Whether to force deletion with active tickets
   */
  deleteTicketPanel: (
    guildId: bigint,
    panelId: bigint,
    force: boolean = false,
  ) =>
    apiRequest<void>(
      `ticket/${guildId}/panels/${panelId}?force=${force}`,
      "DELETE",
    ),

  /**
   * Updates a ticket panel's embed
   * @param guildId The guild ID
   * @param panelId The panel ID (message ID)
   * @param embed Embed configuration
   */
  updateTicketPanelEmbed: (
    guildId: bigint,
    panelId: bigint,
    embed: UpdateEmbedRequest,
  ) =>
    apiRequest<void>(`ticket/${guildId}/panels/${panelId}/embed`, "PUT", embed),

  /**
   * Moves a ticket panel to another channel
   * @param guildId The guild ID
   * @param panelId The panel ID (message ID)
   * @param channelId Target channel ID
   */
  moveTicketPanel: (guildId: bigint, panelId: bigint, channelId: bigint) =>
    apiRequest<void>(`ticket/${guildId}/panels/${panelId}/move`, "PUT", {
      channelId,
    }),

  /**
   * Duplicates a ticket panel
   * @param guildId The guild ID
   * @param panelId The panel ID (message ID) to duplicate
   */
  duplicateTicketPanel: (guildId: bigint, panelId: bigint) =>
    apiRequest<void>(`ticket/${guildId}/panels/${panelId}/duplicate`, "POST"),

  /**
   * Recreates a ticket panel message
   * @param guildId The guild ID
   * @param panelId The panel ID (message ID)
   */
  recreateTicketPanel: (guildId: bigint, panelId: bigint) =>
    apiRequest<void>(`ticket/${guildId}/panels/${panelId}/recreate`, "POST"),

  /**
   * Gets a single panel status
   * @param guildId The guild ID
   * @param panelId The panel ID (message ID)
   * @returns Panel status information
   */
  getSinglePanelStatus: (guildId: bigint, panelId: bigint) =>
    apiRequest<{ panelId: bigint; status: number }>(
      `ticket/${guildId}/panels/${panelId}/status`,
    ),

  /**
   * Gets panel statuses
   * @param guildId The guild ID
   * @returns Panel status information
   */
  getPanelStatus: (guildId: bigint) =>
    apiRequest<PanelStatus[]>(`ticket/${guildId}/panels/status`),

  /**
   * Recreates all panels
   * @param guildId The guild ID
   * @returns Recreate results
   */
  recreateAllPanels: (guildId: bigint) =>
    apiRequest<RecreateAllPanelsResponse>(
      `ticket/${guildId}/panels/recreate-all`,
      "POST",
    ),

  // ============================================
  // Button Management
  // ============================================

  /**
   * Gets panel buttons
   * @param guildId The guild ID
   * @param panelId The panel ID (message ID)
   * @returns List of buttons
   */
  getPanelButtons: (guildId: bigint, panelId: bigint) =>
    apiRequest<PanelButton[]>(`ticket/${guildId}/panels/${panelId}/buttons`),

  /**
   * Adds a button to a panel
   * @param guildId The guild ID
   * @param panelId The panel ID (message ID)
   * @param button Button configuration
   */
  addPanelButton: (
    guildId: bigint,
    panelId: bigint,
    button: AddButtonRequest,
  ) =>
    apiRequest<void>(
      `ticket/${guildId}/panels/${panelId}/buttons`,
      "POST",
      button,
    ),

  /**
   * Gets a specific button
   * @param guildId The guild ID
   * @param buttonId The button ID
   * @returns Button details
   */
  getButton: (guildId: bigint, buttonId: number) =>
    apiRequest<PanelButton>(`ticket/${guildId}/buttons/${buttonId}`),

  /**
   * Updates a button
   * @param guildId The guild ID
   * @param buttonId The button ID
   * @param button Button updates
   */
  updateButton: (
    guildId: bigint,
    buttonId: number,
    button: UpdateButtonRequest,
  ) => apiRequest<void>(`ticket/${guildId}/buttons/${buttonId}`, "PUT", button),

  /**
   * Reorders buttons on a panel
   * @param guildId The guild ID
   * @param panelId The panel ID
   * @param request Request containing the new button order
   */
  reorderPanelButtons: (
    guildId: bigint,
    panelId: bigint,
    request: ReorderButtonsRequest,
  ) =>
    apiRequest<void>(
      `ticket/${guildId}/panels/${panelId}/buttons/reorder`,
      "PUT",
      request,
    ),

  /**
   * Deletes a button
   * @param guildId The guild ID
   * @param buttonId The button ID
   */
  deleteButton: (guildId: bigint, buttonId: number) =>
    apiRequest<void>(`ticket/${guildId}/buttons/${buttonId}`, "DELETE"),

  // ============================================
  // Select Menu Management
  // ============================================

  /**
   * Gets panel select menus
   * @param guildId The guild ID
   * @param panelId The panel ID (message ID)
   * @returns List of select menus
   */
  getPanelSelectMenus: (guildId: bigint, panelId: bigint) =>
    apiRequest<PanelSelectMenu[]>(
      `ticket/${guildId}/panels/${panelId}/selectmenus`,
    ),

  /**
   * Adds a select menu to a panel
   * @param guildId The guild ID
   * @param panelId The panel ID (message ID)
   * @param menu Select menu configuration
   */
  addPanelSelectMenu: (
    guildId: bigint,
    panelId: bigint,
    menu: AddSelectMenuRequest,
  ) =>
    apiRequest<void>(
      `ticket/${guildId}/panels/${panelId}/selectmenus`,
      "POST",
      menu,
    ),

  /**
   * Updates select menu placeholder
   * @param guildId The guild ID
   * @param menuId The menu ID
   * @param request Placeholder update
   */
  updateSelectMenuPlaceholder: (
    guildId: bigint,
    menuId: number,
    request: UpdatePlaceholderRequest,
  ) =>
    apiRequest<void>(
      `ticket/${guildId}/selectmenus/${menuId}/placeholder`,
      "PUT",
      request,
    ),

  /**
   * Adds an option to a select menu
   * @param guildId The guild ID
   * @param menuId The menu ID
   * @param option Option configuration
   */
  addSelectMenuOption: (
    guildId: bigint,
    menuId: number,
    option: AddSelectOptionRequest,
  ) =>
    apiRequest<void>(
      `ticket/${guildId}/selectmenus/${menuId}/options`,
      "POST",
      option,
    ),

  /**
   * Gets a specific select menu option
   * @param guildId The guild ID
   * @param optionId The option ID
   * @returns Option details
   */
  getSelectMenuOption: (guildId: bigint, optionId: number) =>
    apiRequest<any>(`ticket/${guildId}/selectmenus/options/${optionId}`),

  /**
   * Updates a select menu option
   * @param guildId The guild ID
   * @param optionId The option ID
   * @param option Option updates
   */
  updateSelectMenuOption: (guildId: bigint, optionId: number, option: any) =>
    apiRequest<void>(
      `ticket/${guildId}/selectmenus/options/${optionId}`,
      "PUT",
      option,
    ),

  /**
   * Deletes a select menu
   * @param guildId The guild ID
   * @param menuId The menu ID
   */
  deleteSelectMenu: (guildId: bigint, menuId: number) =>
    apiRequest<void>(`ticket/${guildId}/selectmenus/${menuId}`, "DELETE"),

  /**
   * Deletes a select menu option
   * @param guildId The guild ID
   * @param optionId The option ID
   */
  deleteSelectMenuOption: (guildId: bigint, optionId: number) =>
    apiRequest<void>(
      `ticket/${guildId}/selectmenus/options/${optionId}`,
      "DELETE",
    ),

  // ============================================
  // Ticket Management
  // ============================================

  /**
   * Gets a ticket by ID
   * @param guildId The guild ID
   * @param ticketId The ticket ID
   * @returns Ticket details
   */
  getTicket: (guildId: bigint, ticketId: number) =>
    apiRequest<Ticket>(`ticket/${guildId}/tickets/${ticketId}`),

  /**
   * Gets a ticket by channel ID
   * @param guildId The guild ID
   * @param channelId The channel ID
   * @returns Ticket details
   */
  getTicketByChannel: (guildId: bigint, channelId: bigint) =>
    apiRequest<Ticket>(`ticket/${guildId}/tickets/by-channel/${channelId}`),

  /**
   * Gets all tickets for a guild
   * @param guildId The guild ID
   * @param includeArchived Whether to include archived tickets (default: true)
   * @param includeClosed Whether to include closed tickets (default: true)
   * @param includeDeleted Whether to include soft-deleted tickets (default: false)
   * @returns List of tickets
   */
  getGuildTickets: (
    guildId: bigint,
    includeArchived: boolean = true,
    includeClosed: boolean = true,
    includeDeleted: boolean = false,
  ) =>
    apiRequest<Ticket[]>(
      `ticket/${guildId}/tickets?includeArchived=${includeArchived}&includeClosed=${includeClosed}&includeDeleted=${includeDeleted}`,
    ),

  /**
   * Claims a ticket
   * @param guildId The guild ID
   * @param channelId The ticket channel ID
   * @param request Claim request
   */
  claimTicket: (
    guildId: bigint,
    channelId: bigint,
    request: ClaimTicketRequest,
  ) =>
    apiRequest<void>(
      `ticket/${guildId}/tickets/by-channel/${channelId}/claim`,
      "POST",
      request,
    ),

  /**
   * Unclaims a ticket
   * @param guildId The guild ID
   * @param channelId The ticket channel ID
   */
  unclaimTicket: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(
      `ticket/${guildId}/tickets/by-channel/${channelId}/unclaim`,
      "POST",
    ),

  /**
   * Closes a ticket
   * @param guildId The guild ID
   * @param channelId The ticket channel ID
   * @param reason Close reason
   */
  closeTicket: (guildId: bigint, channelId: bigint, reason?: string) =>
    apiRequest<void>(
      `ticket/${guildId}/tickets/by-channel/${channelId}/close`,
      "POST",
      { reason },
    ),

  /**
   * Archives a ticket
   * @param guildId The guild ID
   * @param ticketId The ticket ID
   */
  archiveTicket: (guildId: bigint, ticketId: number) =>
    apiRequest<void>(`ticket/${guildId}/tickets/${ticketId}/archive`, "POST"),

  /**
   * Sets ticket priority
   * @param guildId The guild ID
   * @param channelId The ticket channel ID
   * @param request Priority request
   */
  setTicketPriority: (
    guildId: bigint,
    channelId: bigint,
    request: SetPriorityRequest,
  ) =>
    apiRequest<void>(
      `ticket/${guildId}/tickets/by-channel/${channelId}/priority`,
      "POST",
      request,
    ),

  /**
   * Adds tags to a ticket
   * @param guildId The guild ID
   * @param channelId The ticket channel ID
   * @param request Tags to add
   */
  addTicketTags: (
    guildId: bigint,
    channelId: bigint,
    request: AddTagsRequest,
  ) =>
    apiRequest<void>(
      `ticket/${guildId}/tickets/by-channel/${channelId}/tags`,
      "POST",
      request,
    ),

  /**
   * Removes tags from a ticket
   * @param guildId The guild ID
   * @param channelId The ticket channel ID
   * @param request Tags to remove
   */
  removeTicketTags: (
    guildId: bigint,
    channelId: bigint,
    request: RemoveTagsRequest,
  ) =>
    apiRequest<void>(
      `ticket/${guildId}/tickets/by-channel/${channelId}/tags`,
      "DELETE",
      request,
    ),

  /**
   * Adds notes to a ticket
   * @param guildId The guild ID
   * @param channelId The ticket channel ID
   * @param notes Note content
   */
  addTicketNotes: (guildId: bigint, channelId: bigint, notes: string) =>
    apiRequest<void>(
      `ticket/${guildId}/tickets/by-channel/${channelId}/notes`,
      "POST",
      { notes },
    ),

  /**
   * Edits an existing ticket note
   * @param guildId The guild ID
   * @param noteId The note ID
   * @param request Edit note request
   */
  editTicketNote: (guildId: bigint, noteId: number, request: EditNoteRequest) =>
    apiRequest<void>(
      `ticket/${guildId}/tickets/notes/${noteId}`,
      "PUT",
      request,
    ),

  /**
   * Deletes a ticket note
   * @param guildId The guild ID
   * @param noteId The note ID
   * @param request Delete note request
   */
  deleteTicketNote: (
    guildId: bigint,
    noteId: number,
    request: DeleteNoteRequest,
  ) =>
    apiRequest<void>(
      `ticket/${guildId}/tickets/notes/${noteId}`,
      "DELETE",
      request,
    ),

  // ============================================
  // Case Management
  // ============================================

  /**
   * Gets all ticket cases
   * @param guildId The guild ID
   * @returns List of cases
   */
  getTicketCases: (guildId: bigint) =>
    apiRequest<TicketCase[]>(`ticket/${guildId}/cases`),

  /**
   * Gets a specific ticket case
   * @param guildId The guild ID
   * @param caseId The case ID
   * @returns Case details
   */
  getTicketCase: (guildId: bigint, caseId: number) =>
    apiRequest<TicketCase>(`ticket/${guildId}/cases/${caseId}`),

  /**
   * Creates a new ticket case
   * @param guildId The guild ID
   * @param ticketCase Case configuration
   */
  createTicketCase: (guildId: bigint, ticketCase: CreateCaseRequest) =>
    apiRequest<void>(`ticket/${guildId}/cases`, "POST", ticketCase),

  /**
   * Updates a ticket case
   * @param guildId The guild ID
   * @param caseId The case ID
   * @param ticketCase Case updates
   */
  updateTicketCase: (
    guildId: bigint,
    caseId: number,
    ticketCase: UpdateCaseRequest,
  ) => apiRequest<void>(`ticket/${guildId}/cases/${caseId}`, "PUT", ticketCase),

  /**
   * Closes a ticket case
   * @param guildId The guild ID
   * @param caseId The case ID
   */
  closeTicketCase: (guildId: bigint, caseId: number) =>
    apiRequest<void>(`ticket/${guildId}/cases/${caseId}/close`, "POST"),

  /**
   * Reopens a ticket case
   * @param guildId The guild ID
   * @param caseId The case ID
   */
  reopenTicketCase: (guildId: bigint, caseId: number) =>
    apiRequest<void>(`ticket/${guildId}/cases/${caseId}/reopen`, "POST"),

  /**
   * Links tickets to a case
   * @param guildId The guild ID
   * @param caseId The case ID
   * @param ticketIds Ticket IDs to link
   */
  linkTicketsToCase: (guildId: bigint, caseId: number, ticketIds: number[]) =>
    apiRequest<void>(`ticket/${guildId}/cases/${caseId}/link-tickets`, "POST", {
      ticketIds,
    }),

  /**
   * Unlinks tickets from their case
   * @param guildId The guild ID
   * @param ticketIds Ticket IDs to unlink
   */
  unlinkTickets: (guildId: bigint, ticketIds: number[]) =>
    apiRequest<void>(`ticket/${guildId}/unlink-tickets`, "POST", { ticketIds }),

  /**
   * Adds notes to a case
   * @param guildId The guild ID
   * @param caseId The case ID
   * @param notes Note content
   */
  addCaseNotes: (guildId: bigint, caseId: number, notes: string) =>
    apiRequest<void>(`ticket/${guildId}/cases/${caseId}/notes`, "POST", {
      notes,
    }),

  // ============================================
  // Statistics
  // ============================================

  /**
   * Gets optimized overview data for the dashboard without expensive Discord API calls
   * @param guildId The guild ID
   * @param activityDays Number of days to include in activity summary (default 30)
   * @returns Overview data with statistics and counts
   */
  getTicketOverview: (guildId: bigint, activityDays?: number) => {
    const daysQs = activityDays ? `?activityDays=${activityDays}` : "";
    return apiRequest<any>(`ticket/${guildId}/overview${daysQs}`);
  },

  /**
   * Gets ticket statistics for the guild
   * @param guildId The guild ID
   * @returns Guild statistics
   */
  getTicketStats: (guildId: bigint) =>
    apiRequest<GuildStatistics>(`ticket/${guildId}/statistics`),

  /**
   * Gets user ticket statistics
   * @param guildId The guild ID
   * @param userId The user ID
   * @returns User statistics
   */
  getUserTicketStats: (guildId: bigint, userId: bigint) =>
    apiRequest<UserStatistics>(`ticket/${guildId}/statistics/users/${userId}`),

  /**
   * Gets ticket activity data
   * @param guildId The guild ID
   * @param days Number of days to look back
   * @returns Activity data
   */
  getTicketActivity: (guildId: bigint, days?: number) => {
    const daysQs = days ? `?days=${days}` : "";
    return apiRequest<TicketActivity[]>(
      `ticket/${guildId}/statistics/activity${daysQs}`,
    );
  },

  /**
   * Gets staff response statistics
   * @param guildId The guild ID
   * @returns Staff response stats
   */
  getStaffResponseStats: (guildId: bigint) =>
    apiRequest<StaffResponseStats[]>(
      `ticket/${guildId}/statistics/staff-response`,
    ),

  // ============================================
  // Priority Management
  // ============================================

  /**
   * Gets ticket priorities
   * @param guildId The guild ID
   * @returns List of priorities
   */
  getTicketPriorities: (guildId: bigint) =>
    apiRequest<TicketPriority[]>(`ticket/${guildId}/priorities`),

  /**
   * Creates a ticket priority
   * @param guildId The guild ID
   * @param priority Priority configuration
   */
  createTicketPriority: (guildId: bigint, priority: CreatePriorityRequest) =>
    apiRequest<void>(`ticket/${guildId}/priorities`, "POST", priority),

  /**
   * Deletes a ticket priority
   * @param guildId The guild ID
   * @param priorityId The priority ID
   */
  deleteTicketPriority: (guildId: bigint, priorityId: number) =>
    apiRequest<void>(`ticket/${guildId}/priorities/${priorityId}`, "DELETE"),

  // ============================================
  // Tag Management
  // ============================================

  /**
   * Gets ticket tags
   * @param guildId The guild ID
   * @returns List of tags
   */
  getTicketTags: (guildId: bigint) =>
    apiRequest<TicketTag[]>(`ticket/${guildId}/tags`),

  /**
   * Creates a ticket tag
   * @param guildId The guild ID
   * @param tag Tag configuration
   */
  createTicketTag: (guildId: bigint, tag: CreateTagRequest) =>
    apiRequest<void>(`ticket/${guildId}/tags`, "POST", tag),

  /**
   * Deletes a ticket tag
   * @param guildId The guild ID
   * @param tagId The tag ID
   */
  deleteTicketTag: (guildId: bigint, tagId: number) =>
    apiRequest<void>(`ticket/${guildId}/tags/${tagId}`, "DELETE"),

  // ============================================
  // Blacklist Management
  // ============================================

  /**
   * Gets ticket blacklist
   * @param guildId The guild ID
   * @returns List of blacklisted users
   */
  getTicketBlacklist: (guildId: bigint) =>
    apiRequest<BlacklistedUserResponse[]>(`ticket/${guildId}/blacklist`),

  /**
   * Blacklists a user from creating tickets
   * @param guildId The guild ID
   * @param userId The user ID to blacklist
   * @param request Blacklist reason
   */
  blacklistUser: (
    guildId: bigint,
    userId: bigint,
    request: BlacklistUserRequest,
  ) =>
    apiRequest<void>(`ticket/${guildId}/blacklist/${userId}`, "POST", request),

  /**
   * Removes a user from blacklist
   * @param guildId The guild ID
   * @param userId The user ID
   */
  unblacklistUser: (guildId: bigint, userId: bigint) =>
    apiRequest<void>(`ticket/${guildId}/blacklist/${userId}`, "DELETE"),

  // ============================================
  // Batch Operations
  // ============================================

  /**
   * Closes inactive tickets
   * @param guildId The guild ID
   * @param inactiveHours Hours of inactivity
   */
  closeInactiveTickets: (guildId: bigint, inactiveHours: number) =>
    apiRequest<void>(`ticket/${guildId}/batch/close-inactive`, "POST", {
      inactiveHours,
    }),

  /**
   * Batch moves tickets between categories
   * @param guildId The guild ID
   * @param request Move request
   */
  moveTicketsBatch: (guildId: bigint, request: BatchMoveTicketsRequest) =>
    apiRequest<void>(`ticket/${guildId}/batch/move-tickets`, "POST", request),

  /**
   * Batch adds role to all active tickets
   * @param guildId The guild ID
   * @param request Role request
   */
  addRoleBatch: (guildId: bigint, request: BatchAddRoleRequest) =>
    apiRequest<void>(`ticket/${guildId}/batch/add-role`, "POST", request),

  /**
   * Batch transfers tickets between staff members
   * @param guildId The guild ID
   * @param request Transfer request
   */
  transferTicketsBatch: (
    guildId: bigint,
    request: BatchTransferTicketsRequest,
  ) =>
    apiRequest<void>(
      `ticket/${guildId}/batch/transfer-tickets`,
      "POST",
      request,
    ),

  // ============================================
  // Settings
  // ============================================

  /**
   * Gets ticket settings for the guild
   * @param guildId The guild ID
   * @returns Ticket settings including transcript and log channels
   */
  getTicketSettings: (guildId: bigint) =>
    apiRequest<{
      transcriptChannelId?: bigint;
      logChannelId?: bigint;
      defaultMaxTickets?: number;
      blacklistedUsers?: bigint[];
    }>(`ticket/${guildId}/settings`),

  /**
   * Sets ticket transcript channel
   * @param guildId The guild ID
   * @param request Channel configuration
   */
  setTicketTranscriptChannel: (guildId: bigint, request: SetChannelRequest) =>
    apiRequest<void>(
      `ticket/${guildId}/settings/transcript-channel`,
      "PUT",
      request,
    ),

  /**
   * Sets ticket log channel
   * @param guildId The guild ID
   * @param request Channel configuration
   */
  setTicketLogChannel: (guildId: bigint, request: SetChannelRequest) =>
    apiRequest<void>(`ticket/${guildId}/settings/log-channel`, "PUT", request),
};
