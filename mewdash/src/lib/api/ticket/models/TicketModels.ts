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
 * Ticket
 * Maps to DataModel.Ticket
 */
export interface Ticket {
  id: number;
  guildId: bigint;
  channelId: bigint;
  creatorId: bigint;
  buttonId: number | null;
  selectOptionId: number | null;
  createdAt: string;
  closedAt: string | null;
  isArchived: boolean;
  tags: string[] | null;
  claimedBy: bigint | null;
  lastActivityAt: string | null;
  caseId: number | null;
  modalResponses: string | null;
  priority: string | null;
  transcriptUrl: string | null;
  isDeleted: boolean;
}

/**
 * Ticket panel
 * Maps to DataModel.TicketPanel
 */
export interface TicketPanel {
  id: number;
  guildId: bigint;
  channelId: bigint;
  embedJson: string;
  messageId: bigint;
}

/**
 * Panel button
 * Maps to Mewdeko.Database.L2DB.PanelButton
 */
export interface PanelButton {
  id: number;
  panelId: number;
  label: string;
  emoji: string | null;
  customId: string;
  style: number;
  openMessageJson: string | null;
  modalJson: string | null;
  channelNameFormat: string;
  categoryId: bigint | null;
  archiveCategoryId: bigint | null;
  supportRoles: bigint[];
  viewerRoles: bigint[];
  autoCloseTime: string | null;
  requiredResponseTime: string | null;
  maxActiveTickets: number;
  allowedPriorities: string[] | null;
  defaultPriority: string | null;
  saveTranscript: boolean;
  deleteOnClose: boolean;
  lockOnClose: boolean;
  renameOnClose: boolean;
  removeCreatorOnClose: boolean;
  deleteDelay: string;
  lockOnArchive: boolean;
  renameOnArchive: boolean;
  removeCreatorOnArchive: boolean;
  autoArchiveOnClose: boolean;
}

/**
 * Panel select menu
 * Maps to DataModel.PanelSelectMenu
 */
export interface PanelSelectMenu {
  id: number;
  panelId: number;
  customId: string;
  placeholder: string;
}

/**
 * Ticket case
 * Maps to DataModel.TicketCase
 */
export interface TicketCase {
  id: number;
  guildId: bigint;
  title: string;
  description: string | null;
  createdAt: string;
  createdBy: bigint;
  closedAt: string | null;
}

/**
 * Ticket priority
 * Maps to DataModel.TicketPriority
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
 * Maps to DataModel.TicketTag
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
  archivedTickets: number;
  averageResponseTime: string;
  averageResolutionTime: string;
}

/**
 * User statistics
 */
export interface UserStatistics {
  userId: bigint;
  ticketsCreated: number;
  ticketsClaimed: number;
  averageResponseTime: string;
  rating: number;
}

/**
 * Staff response stats
 */
export interface StaffResponseStats {
  staffId: bigint;
  username: string;
  ticketsClaimed: number;
  averageResponseTime: string;
  rating: number;
}

/**
 * Ticket activity
 */
export interface TicketActivity {
  date: string;
  opened: number;
  closed: number;
}

/**
 * Panel status
 */
export interface PanelStatus {
  panelId: number;
  channelId: bigint;
  messageExists: boolean;
  buttonCount: number;
  selectMenuCount: number;
}

/**
 * Recreate all panels response
 */
export interface RecreateAllPanelsResponse {
  recreatedCount: number;
  failedCount: number;
  errors: string[];
}

/**
 * Blacklisted user response
 */
export interface BlacklistedUserResponse {
  userId: bigint;
  username: string;
  reason: string | null;
  blacklistedAt: string;
  blacklistedBy: bigint;
}
