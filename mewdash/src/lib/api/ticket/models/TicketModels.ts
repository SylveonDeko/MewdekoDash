// lib/api/ticket/models/TicketModels.ts

/**
 * Button styles
 */
export enum ButtonStyle {
  Primary = 1,
  Secondary = 2,
  Success = 3,
  Danger = 4,
  Link = 5,
}

/**
 * Ticket as the list and detail endpoints return it
 */
export interface Ticket {
  id: number;
  guildId: bigint;
  channelId: bigint;
  channelName?: string;
  creatorId: bigint;
  creatorName?: string;
  buttonId: number | null;
  buttonLabel?: string | null;
  selectOptionId: number | null;
  optionLabel?: string | null;
  createdAt: string;
  closedAt: string | null;
  isArchived: boolean;
  tags: string[] | null;
  claimedBy: bigint | null;
  claimedByName?: string | null;
  lastActivityAt: string | null;
  caseId: number | null;
  modalResponses?: string | null;
  priority: string | null;
  transcriptUrl: string | null;
  isDeleted: boolean;
}

/**
 * Staff note on a ticket
 */
export interface TicketNote {
  id: number;
  authorId: bigint;
  authorName: string;
  content: string;
  createdAt: string;
}

/**
 * Ticket panel as the panel list returns it
 */
export interface TicketPanel {
  id: number;
  guildId: bigint;
  channelId: bigint;
  channelName: string;
  channelMention?: string | null;
  embedJson: string;
  messageId: bigint;
  buttonCount: number;
  selectMenuCount: number;
}

/**
 * Button on a panel, as the panel's button list returns it
 */
export interface PanelButton {
  id: number;
  customId: string;
  label: string;
  emoji: string | null;
  style: number;
  categoryId: bigint | null;
  archiveCategoryId: bigint | null;
  threadChannelId: bigint | null;
  supportRoles: bigint[];
  viewerRoles: bigint[];
  hasModal: boolean;
  hasCustomOpenMessage: boolean;
}

/**
 * Option in a panel's select menu
 */
export interface PanelSelectOption {
  id: number;
  label: string;
  value: string;
  description: string | null;
  emoji: string | null;
  categoryId: bigint | null;
  archiveCategoryId: bigint | null;
  threadChannelId: bigint | null;
  hasModal: boolean;
  hasCustomOpenMessage: boolean;
}

/**
 * Select menu on a panel
 */
export interface PanelSelectMenu {
  id: number;
  customId: string;
  placeholder: string;
  options: PanelSelectOption[];
}

/**
 * Full settings of one button or select option. TimeSpans arrive as "d.hh:mm:ss".
 */
export interface TicketComponentDetail {
  id: number;
  label: string;
  style?: number;
  description?: string | null;
  emoji: string | null;
  customId?: string;
  value?: string;
  channelNameFormat: string | null;
  categoryId: bigint | null;
  categoryName?: string | null;
  archiveCategoryId: bigint | null;
  archiveCategoryName?: string | null;
  claimedCategoryId: bigint | null;
  dmTranscript: boolean;
  threadChannelId: bigint | null;
  supportRoles: bigint[];
  viewerRoles: bigint[];
  autoCloseTime: string | null;
  requiredResponseTime: string | null;
  maxActiveTickets: number;
  allowedPriorities: string[] | null;
  defaultPriority: string | null;
  saveTranscript: boolean | null;
  deleteOnClose: boolean;
  lockOnClose: boolean;
  renameOnClose: boolean;
  removeCreatorOnClose: boolean;
  deleteDelay: string;
  lockOnArchive: boolean;
  renameOnArchive: boolean;
  removeCreatorOnArchive: boolean;
  autoArchiveOnClose: boolean;
  openMessageJson: string | null;
  modalJson: string | null;
}

/**
 * Ticket case
 */
export interface TicketCase {
  id: number;
  guildId: bigint;
  title: string;
  description: string | null;
  createdAt: string;
  createdBy: bigint;
  createdByName?: string;
  closedAt: string | null;
  linkedTickets: number;
}

/**
 * Ticket linked to a case
 */
export interface CaseTicket {
  id: number;
  channelId: bigint;
  channelName: string;
  creatorId: bigint;
  creatorName: string;
  createdAt: string;
  closedAt: string | null;
  isArchived: boolean;
}

/**
 * Note on a case
 */
export interface CaseNote {
  id: number;
  content: string;
  authorId: bigint;
  createdAt: string;
}

/**
 * Case with its tickets and notes
 */
export interface TicketCaseDetail extends Omit<TicketCase, "linkedTickets"> {
  linkedTickets: CaseTicket[];
  notes: CaseNote[];
}

/**
 * Ticket priority
 */
export interface TicketPriority {
  id: number;
  guildId: bigint;
  priorityId: string;
  name: string;
  emoji: string;
  level: number;
  pingStaff: boolean;
  responseTime: string;
  color: number;
  dateAdded: string | null;
}

/**
 * Ticket tag
 */
export interface TicketTag {
  id: number;
  guildId: bigint;
  tagId: string;
  name: string;
  description: string;
  color: number;
  dateAdded: string | null;
}

/**
 * Guild statistics
 */
export interface GuildStatistics {
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  averageResponseTime: number | string;
  averageResolutionTime: number | string;
  ticketsByPriority?: Record<string, number>;
}

/**
 * Statistics for one user
 */
export type UserStatistics = Record<string, unknown>;

/**
 * Tickets opened per day
 */
export type TicketActivity = Record<string, number>;

/**
 * Staff response stats
 */
export interface StaffResponseStats {
  staffId: bigint;
  staffName: string;
  averageResponseTimeMinutes: number;
}

/**
 * Panel status: 0 is fine, 1 means the message is gone, 2 means the channel is gone
 */
export interface PanelStatus {
  panelId: bigint;
  status: number;
}

/**
 * Recreate all panels response
 */
export interface RecreateAllPanelsResponse {
  recreated: number;
  failed: number;
  errors: string[];
}

/**
 * Blacklisted user response
 */
export interface BlacklistedUserResponse {
  userId: bigint;
  username: string;
  restrictedTypes: string[] | null;
}

/**
 * Server-wide ticket settings
 */
export interface TicketSettings {
  transcriptChannelId?: bigint | null;
  logChannelId?: bigint | null;
  defaultMaxTickets?: number;
  blacklistedUsers?: bigint[];
  dmTranscriptOnClose?: boolean;
  enableStaffPings?: boolean;
  enableDmNotifications?: boolean;
  notificationRoles?: bigint[];
}

/**
 * What the overview endpoint returns
 */
export interface TicketOverview {
  statistics: GuildStatistics | null;
  ticketActivity: Record<string, number> | null;
  staffResponseStats: StaffResponseStats[];
  panels: Array<{ messageId: bigint; channelId: bigint; channelName: string; buttonCount: number; selectMenuCount: number }>;
  priorities: TicketPriority[];
  tags: TicketTag[];
  cases: Array<{ id: number; title: string; createdAt: string; closedAt: string | null }>;
}
