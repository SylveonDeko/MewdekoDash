export interface TicketPanel {
  id: number;
  guildId: bigint;
  channelId: bigint;
  embedJson: string;
  messageId: bigint;
  panelButtons?: PanelButton[] | null; // Association - buttons that belong to this panel
  panelSelectMenus?: PanelSelectMenu[] | null; // Association - select menus that belong to this panel
}

export interface PanelButton {
  id: number;
  panelId: number;
  label: string;
  emoji: string | null;
  customId: string;
  style: number; // This corresponds to Discord's ButtonStyle enum
  openMessageJson: string | null;
  modalJson: string | null;
  channelNameFormat: string | null;
  categoryId: bigint | null;
  archiveCategoryId: bigint | null;
  supportRoles: bigint[];
  viewerRoles: bigint[];
  autoCloseTime: string | null; // C# TimeSpan translates to string "d.hh:mm:ss"
  requiredResponseTime: string | null; // C# TimeSpan
  maxActiveTickets: number;
  allowedPriorities: string[] | null;
  defaultPriority: string | null;
  saveTranscript: boolean;
  deleteOnClose: boolean;
  lockOnClose: boolean;
  renameOnClose: boolean;
  removeCreatorOnClose: boolean;
  deleteDelay: string; // C# TimeSpan
  lockOnArchive: boolean;
  renameOnArchive: boolean;
  removeCreatorOnArchive: boolean;
  autoArchiveOnClose: boolean;
  panel?: TicketPanel; // Navigation property - the panel this button belongs to
  tickets?: Ticket[]; // Navigation property - tickets created with this button
}

export interface PanelSelectMenu {
  id: number;
  panelId: number;
  customId: string;
  placeholder: string;
  panel?: TicketPanel; // Navigation property - the panel this select menu belongs to
  selectMenuOptions?: SelectMenuOption[]; // Navigation property - options in this select menu
}

export interface SelectMenuOption extends Omit<PanelButton, 'panelId' | 'customId' | 'style' | 'saveTranscript' | 'panel' | 'tickets'> {
  selectMenuId: number;
  value: string;
  description: string | null;
  saveTranscript: boolean | null; // C# SelectMenuOption has SaveTranscript as bool? (nullable)
  selectMenu?: PanelSelectMenu; // Navigation property - the select menu this option belongs to
  tickets?: Ticket[]; // Navigation property - tickets created with this option
}

export interface Ticket {
  id: number;
  guildId: bigint;
  channelId: bigint;
  creatorId: bigint;
  buttonId: number | null;
  selectOptionId: number | null;
  createdAt: string; // ISO DateTime string
  closedAt: string | null; // ISO DateTime string
  isArchived: boolean;
  tags: string[] | null;
  claimedBy: bigint | null;
  lastActivityAt: string | null; // ISO DateTime string
  caseId: number | null;
  modalResponses: string | null;
  priority: string | null;
  transcriptUrl: string | null;
  isDeleted: boolean;
  ticketNotes?: TicketNote[]; // Navigation property - notes for this ticket
  button?: PanelButton | null; // Navigation property - the button that created this ticket
  selectOption?: SelectMenuOption | null; // Navigation property - the select option that created this ticket  
  case?: TicketCase | null; // Navigation property - the case this ticket belongs to
}

export interface TicketCase {
  id: number;
  guildId: bigint;
  title: string;
  description: string | null;
  createdAt: string; // ISO DateTime string
  createdBy: bigint;
  closedAt: string | null; // ISO DateTime string
  caseNotes?: CaseNote[] | null; // Navigation property - notes for this case
  tickets?: Ticket[] | null; // Navigation property - tickets linked to this case
}

export interface TicketPriority {
  id: number;
  guildId: bigint;
  priorityId: string;
  name: string;
  emoji: string;
  level: number;
  pingStaff: boolean;
  responseTime: string; // C# TimeSpan
  color: number; // C# long
  dateAdded: string | null; // ISO DateTime string
}

export interface TicketTag {
  id: number;
  guildId: bigint;
  tagId: string;
  name: string;
  description: string;
  color: number; // C# long
  dateAdded: string | null; // ISO DateTime string
}

export interface TicketNote {
  id: number;
  ticketId: number;
  authorId: bigint;
  content: string;
  createdAt: string; // ISO DateTime string
  ticket?: Ticket; // Navigation property - the ticket this note belongs to
  noteEdits?: NoteEdit[]; // Navigation property - edits for this note
}

export interface CaseNote {
  id: number;
  caseId: number;
  authorId: bigint;
  content: string;
  createdAt: string; // ISO DateTime string
  case?: TicketCase; // Navigation property - the case this note belongs to
  noteEdits?: NoteEdit[]; // Navigation property - edits for this note
}

export interface NoteEdit {
  id: number;
  oldContent: string;
  newContent: string;
  editorId: bigint;
  editedAt: string; // ISO DateTime string
  caseNoteId: number | null;
  ticketNoteId: number | null;
  caseNote?: CaseNote | null; // Navigation property - the case note that was edited
  ticketNote?: TicketNote | null; // Navigation property - the ticket note that was edited
}

export interface CreatePanelRequest {
  channelId: bigint;
  embedJson?: string;
  title?: string;
  description?: string;
  color?: { rawValue: number }; // Corresponds to Discord.Color
}

export interface UpdateEmbedRequest {
  embedJson: string;
}

export interface AddButtonRequest extends Omit<PanelButton, 'id' | 'panelId' | 'customId' | 'supportRoles' | 'viewerRoles'> {
  // ulong[] is translated to bigint[]
  supportRoles?: bigint[];
  viewerRoles?: bigint[];
}

export interface UpdateButtonRequest {
  label?: string;
  emoji?: string;
  style?: number; // Corresponds to ButtonStyle enum
  categoryId?: bigint;
  archiveCategoryId?: bigint;
  supportRoles?: bigint[];
  viewerRoles?: bigint[];
  autoCloseTime?: string; // TimeSpan
  requiredResponseTime?: string; // TimeSpan
  maxActiveTickets?: number;
  allowedPriorities?: string[];
  defaultPriority?: string;
  saveTranscript?: boolean;
  deleteOnClose?: boolean;
  lockOnClose?: boolean;
  renameOnClose?: boolean;
  removeCreatorOnClose?: boolean;
  deleteDelay?: string; // TimeSpan
  lockOnArchive?: boolean;
  renameOnArchive?: boolean;
  removeCreatorOnArchive?: boolean;
  autoArchiveOnClose?: boolean;
}

export interface AddSelectMenuRequest {
  placeholder: string;
  firstOptionLabel: string;
  firstOptionDescription?: string;
  firstOptionEmoji?: string;
}

export interface AddSelectOptionRequest {
  label: string;
  description?: string;
  emoji?: string;
  openMessageJson?: string;
  modalJson?: string;
  channelFormat?: string;
  categoryId?: bigint;
  archiveCategoryId?: bigint;
  supportRoles?: bigint[];
  viewerRoles?: bigint[];
  autoCloseTime?: string;
  requiredResponseTime?: string;
  maxActiveTickets?: number;
  allowedPriorities?: string[];
  defaultPriority?: string;
}

export interface UpdatePlaceholderRequest {
  placeholder: string;
}

export interface ClaimTicketRequest {
  staffId: bigint;
}

export interface AddTagsRequest {
  tagIds: string[];
  staffId: bigint;
}

export interface RemoveTagsRequest {
  tagIds: string[];
  staffId: bigint;
}

export interface CreateCaseRequest {
  title: string;
  description: string;
  creatorId: bigint;
}

export interface UpdateCaseRequest {
  title?: string;
  description?: string;
}

export interface LinkTicketsRequest {
  ticketIds: number[];
}

export interface UnlinkTicketsRequest {
  ticketIds: number[];
}

export interface CreatePriorityRequest {
  id: string;
  name: string;
  emoji: string;
  level: number;
  pingStaff: boolean;
  responseTime: string; // TimeSpan
  color: { rawValue: number }; // Discord.Color
}

export interface CreateTagRequest {
  id: string;
  name: string;
  description: string;
  color: { rawValue: number }; // Discord.Color
}

export interface BlacklistUserRequest {
  reason?: string;
}

export interface BatchMoveTicketsRequest {
  sourceCategoryId: bigint;
  targetCategoryId: bigint;
}

export interface BatchAddRoleRequest {
  roleId: bigint;
  viewOnly: boolean;
}

export interface BatchTransferTicketsRequest {
  fromStaffId: bigint;
  toStaffId: bigint;
}

export interface SetChannelRequest {
  channelId: bigint;
}

export interface SetPriorityRequest {
  priorityId: string;
  staffId: bigint;
}

/**
 * The enriched panel object returned from the API, not the direct DB model.
 */
export interface TicketPanelResponse {
  id: number;
  messageId: bigint;
  guildId: bigint;
  channelId: bigint;
  channelName: string;
  channelMention: string | null;
  embedJson: string;
  buttonCount: number;
  selectMenuCount: number;
}

/**
 * The enriched ticket object returned from the API.
 */
export interface TicketResponse {
  id: number;
  guildId: bigint;
  channelId: bigint;
  channelName: string;
  creatorId: bigint;
  creatorName: string;
  claimedBy: bigint | null;
  claimedByName: string | null;
  buttonId: number | null;
  selectOptionId: number | null;
  priority: string | null;
  tags: string[] | null;
  createdAt: string;
  closedAt: string | null;
  lastActivityAt: string | null;
  isArchived: boolean;
  isDeleted: boolean;
  transcriptUrl: string | null;
  caseId: number | null;
  modalResponses: string | null;
}

/**
 * The response from a panel deletion operation.
 */
export interface DeletePanelResponse {
  success: boolean;
  error?: string;
  activeTicketsCleared: number;
  deletedTicketsCleared: number;
}

export interface PanelStatus {
  panelId: bigint;
  channelId: bigint;
  messageExists: boolean;
  error?: string;
}

export interface RecreateAllPanelsResponse {
  recreated: number;
  failed: number;
  errors: string[];
}

/**
 * Represents detailed information about a specific ticket for user statistics.
 * Based on the C# UserTicketInfo class.
 */
export interface UserTicketInfo {
  /** The unique identifier of the ticket. */
  ticketId: number;
  /** The type or category of the ticket. */
  type: string;
  /** The date and time when the ticket was created (ISO string). */
  createdAt: string;
  /** The optional date and time when the ticket was closed (ISO string). */
  closedAt: string | null;
}

/**
 * Represents statistics about tickets in a guild.
 * Based on the C# GuildStatistics class.
 */
export interface GuildStatistics {
  /** The total number of tickets ever created in the guild. */
  totalTickets: number;
  /** The number of currently open tickets in the guild. */
  openTickets: number;
  /** The number of closed tickets in the guild. */
  closedTickets: number;
  /** The average time in minutes between ticket creation and first staff response. */
  averageResponseTime: number;
  /** The average time in hours between ticket creation and closure. */
  averageResolutionTime: number;
  /** The distribution of tickets by their type. */
  ticketsByType: Record<string, number>;
  /** The distribution of tickets by their priority level. */
  ticketsByPriority: Record<string, number>;
}

/**
 * Represents a user's ticket statistics.
 * Based on the C# UserStatistics class.
 */
export interface UserStatistics {
  /** The total number of tickets created by the user. */
  totalTickets: number;
  /** The number of currently open tickets created by the user. */
  openTickets: number;
  /** The number of closed tickets created by the user. */
  closedTickets: number;
  /** The distribution of the user's tickets by type. */
  ticketsByType: Record<string, number>;
  /** A list of the user's most recent tickets. */
  recentTickets: UserTicketInfo[];
}

export interface TicketActivity {
  date: string; // "YYYY-MM-DD"
  count: number;
}

export interface StaffResponseStats {
  staffId: bigint;
  staffName: string;
  averageResponseTimeMinutes: number;
}

export interface BlacklistedUserResponse {
  userId: bigint;
  username: string;
  restrictedTypes: string[];
}