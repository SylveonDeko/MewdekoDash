// lib/api/ticket/models/TicketRequests.ts
import type { ButtonStyle } from "./TicketModels";

/**
 * Create panel request
 * Maps to Mewdeko.Controllers.Common.Tickets.CreatePanelRequest
 */
export interface CreatePanelRequest {
  channelId: bigint;
  embedJson?: string | null;
  title?: string | null;
  description?: string | null;
  color?: number | null;
}

/**
 * Update embed request
 * Maps to Mewdeko.Controllers.Common.Tickets.UpdateEmbedRequest
 */
export interface UpdateEmbedRequest {
  embedJson: string;
}

/**
 * Add button request
 * Maps to Mewdeko.Controllers.Common.Tickets.AddButtonRequest
 */
export interface AddButtonRequest {
  label: string;
  emoji?: string | null;
  style?: ButtonStyle;
  openMessageJson?: string | null;
  modalJson?: string | null;
  channelFormat?: string | null;
  categoryId?: bigint | null;
  archiveCategoryId?: bigint | null;
  supportRoles?: bigint[] | null;
  viewerRoles?: bigint[] | null;
  autoCloseTime?: string | null;
  requiredResponseTime?: string | null;
  maxActiveTickets?: number;
  allowedPriorities?: string[] | null;
  defaultPriority?: string | null;
}

/**
 * Update button request
 * Maps to Mewdeko.Controllers.Common.Tickets.UpdateButtonRequest
 */
export interface UpdateButtonRequest {
  label?: string | null;
  emoji?: string | null;
  style?: ButtonStyle | null;
  categoryId?: bigint | null;
  archiveCategoryId?: bigint | null;
  supportRoles?: bigint[] | null;
  viewerRoles?: bigint[] | null;
  autoCloseTime?: string | null;
  requiredResponseTime?: string | null;
  maxActiveTickets?: number | null;
  allowedPriorities?: string[] | null;
  defaultPriority?: string | null;
  saveTranscript?: boolean | null;
  deleteOnClose?: boolean | null;
  lockOnClose?: boolean | null;
  renameOnClose?: boolean | null;
  removeCreatorOnClose?: boolean | null;
  deleteDelay?: string | null;
  lockOnArchive?: boolean | null;
  renameOnArchive?: boolean | null;
  removeCreatorOnArchive?: boolean | null;
  autoArchiveOnClose?: boolean | null;
  modalJson?: string | null;
  openMessageJson?: string | null;
}

/**
 * Add select menu request
 * Maps to Mewdeko.Controllers.Common.Tickets.AddSelectMenuRequest
 */
export interface AddSelectMenuRequest {
  placeholder: string;
  firstOptionLabel: string;
  firstOptionDescription?: string | null;
  firstOptionEmoji?: string | null;
}

/**
 * Add select option request
 * Maps to Mewdeko.Controllers.Common.Tickets.AddSelectOptionRequest
 */
export interface AddSelectOptionRequest {
  label: string;
  description?: string | null;
  emoji?: string | null;
  openMessageJson?: string | null;
  modalJson?: string | null;
  channelFormat?: string | null;
  categoryId?: bigint | null;
  archiveCategoryId?: bigint | null;
  supportRoles?: bigint[] | null;
  viewerRoles?: bigint[] | null;
  autoCloseTime?: string | null;
  requiredResponseTime?: string | null;
  maxActiveTickets?: number;
  allowedPriorities?: string[] | null;
  defaultPriority?: string | null;
}

/**
 * Update placeholder request
 * Maps to Mewdeko.Controllers.Common.Tickets.UpdatePlaceholderRequest
 */
export interface UpdatePlaceholderRequest {
  placeholder: string;
}

/**
 * Claim ticket request
 * Maps to Mewdeko.Controllers.Common.Tickets.ClaimTicketRequest
 */
export interface ClaimTicketRequest {
  staffId: bigint;
}

/**
 * Set priority request
 * Maps to Mewdeko.Controllers.Common.Tickets.SetPriorityRequest
 */
export interface SetPriorityRequest {
  priorityId: string;
  staffId: bigint;
}

/**
 * Add tags request
 * Maps to Mewdeko.Controllers.Common.Tickets.AddTagsRequest
 */
export interface AddTagsRequest {
  tagIds: string[];
  staffId: bigint;
}

/**
 * Remove tags request
 * Maps to Mewdeko.Controllers.Common.Tickets.RemoveTagsRequest
 */
export interface RemoveTagsRequest {
  tagIds: string[];
  staffId: bigint;
}

/**
 * Create priority request
 * Maps to Mewdeko.Controllers.Common.Tickets.CreatePriorityRequest
 */
export interface CreatePriorityRequest {
  id: string;
  name: string;
  emoji: string;
  level: number;
  pingStaff: boolean;
  responseTime: string;
  color: number;
}

/**
 * Create tag request
 * Maps to Mewdeko.Controllers.Common.Tickets.CreateTagRequest
 */
export interface CreateTagRequest {
  id: string;
  name: string;
  description: string;
  color: number;
}

/**
 * Create case request
 * Maps to Mewdeko.Controllers.Common.Tickets.CreateCaseRequest
 */
export interface CreateCaseRequest {
  title: string;
  description: string;
  creatorId: bigint;
}

/**
 * Update case request
 * Maps to Mewdeko.Controllers.Common.Tickets.UpdateCaseRequest
 */
export interface UpdateCaseRequest {
  title?: string | null;
  description?: string | null;
}

/**
 * Blacklist user request
 * Maps to Mewdeko.Controllers.Common.Tickets.BlacklistUserRequest
 */
export interface BlacklistUserRequest {
  reason?: string | null;
}

/**
 * Batch move tickets request
 * Maps to Mewdeko.Controllers.Common.Tickets.BatchMoveTicketsRequest
 */
export interface BatchMoveTicketsRequest {
  sourceCategoryId: bigint;
  targetCategoryId: bigint;
}

/**
 * Batch transfer tickets request
 * Maps to Mewdeko.Controllers.Common.Tickets.BatchTransferTicketsRequest
 */
export interface BatchTransferTicketsRequest {
  fromStaffId: bigint;
  toStaffId: bigint;
}

/**
 * Batch add role request
 * Maps to Mewdeko.Controllers.Common.Tickets.BatchAddRoleRequest
 */
export interface BatchAddRoleRequest {
  roleId: bigint;
  viewOnly: boolean;
}

/**
 * Add note request
 * Maps to Mewdeko.Controllers.Common.Tickets.AddNoteRequest
 */
export interface AddNoteRequest {
  content: string;
  authorId: bigint;
}

/**
 * Set channel request
 * Maps to Mewdeko.Controllers.Common.Tickets.SetChannelRequest
 */
export interface SetChannelRequest {
  channelId: bigint;
}

/**
 * Move panel request
 * Maps to Mewdeko.Controllers.Common.Tickets.MovePanelRequest
 */
export interface MovePanelRequest {
  channelId: bigint;
}

/**
 * Link tickets request
 * Maps to Mewdeko.Controllers.Common.Tickets.LinkTicketsRequest
 */
export interface LinkTicketsRequest {
  ticketIds: number[];
}

/**
 * Unlink tickets request
 * Maps to Mewdeko.Controllers.Common.Tickets.UnlinkTicketsRequest
 */
export interface UnlinkTicketsRequest {
  ticketIds: number[];
}

/**
 * Edit note request
 * Maps to Mewdeko.Controllers.Common.Tickets.EditNoteRequest
 */
export interface EditNoteRequest {
  content: string;
  authorId: bigint;
}

/**
 * Delete note request
 * Maps to Mewdeko.Controllers.Common.Tickets.DeleteNoteRequest
 */
export interface DeleteNoteRequest {
  authorId: bigint;
}

/**
 * Reorder buttons request
 * Maps to Mewdeko.Controllers.Common.Tickets.ReorderButtonsRequest
 */
export interface ReorderButtonsRequest {
  buttonOrder: number[];
}
