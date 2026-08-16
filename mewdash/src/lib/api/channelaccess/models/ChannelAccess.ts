// lib/api/channelaccess/models/ChannelAccess.ts

/**
 * The lifecycle state of a channel access application.
 * Maps to Mewdeko.Modules.ChannelAccess.Services.AccessApplicationStatus
 */
export enum AccessApplicationStatus {
  Pending = 0,
  Approved = 1,
  Denied = 2,
  Withdrawn = 3,
  Expired = 4,
}

/**
 * What happens to an application when its voting window runs out.
 * Maps to Mewdeko.Modules.ChannelAccess.Services.AccessExpiryBehavior
 */
export enum AccessExpiryBehavior {
  Deny = 0,
  Majority = 1,
  StayOpen = 2,
}

/**
 * How an approved applicant is let into the channel.
 * Maps to Mewdeko.Modules.ChannelAccess.Services.AccessGrantMode
 */
export enum AccessGrantMode {
  Role = 0,
  ChannelPermission = 1,
}

/**
 * A question on a gate's application form.
 * Maps to Mewdeko.Controllers.Common.ChannelAccess.ChannelAccessQuestionResponse
 */
export interface ChannelAccessQuestion {
  id: number;
  position: number;
  question: string;
  placeholder: string | null;
  required: boolean;
  paragraph: boolean;
}

/**
 * A configured access gate on a locked channel.
 * Maps to Mewdeko.Controllers.Common.ChannelAccess.ChannelAccessGateResponse
 */
export interface ChannelAccessGate {
  id: number;
  channelId: bigint;
  accessRoleId: bigint | null;
  grantMode: AccessGrantMode;
  reviewChannelId: bigint | null;
  logChannelId: bigint | null;
  panelChannelId: bigint | null;
  panelMessageId: bigint | null;
  voterRoleId: bigint | null;
  pingRoleId: bigint | null;
  enabled: boolean;
  requiredApprovals: number;
  requiredDenials: number;
  voteDurationHours: number;
  onExpiry: AccessExpiryBehavior;
  allowAbstain: boolean;
  anonymousVotes: boolean;
  anonymousApplicant: boolean;
  minAccountAgeDays: number;
  minServerAgeDays: number;
  reapplyCooldownHours: number;
  dmOnDecision: boolean;
  pendingApplications: number;
  questions: ChannelAccessQuestion[];
}

/**
 * One answer on an application.
 * Maps to Mewdeko.Controllers.Common.ChannelAccess.ChannelAccessAnswerResponse
 */
export interface ChannelAccessAnswer {
  question: string;
  answer: string;
}

/**
 * One vote on an application.
 * Maps to Mewdeko.Controllers.Common.ChannelAccess.ChannelAccessVoteResponse
 */
export interface ChannelAccessVote {
  userId: bigint;
  username: string | null;
  vote: number;
  votedAt: string | null;
}

/**
 * An application to join a gated channel.
 * Maps to Mewdeko.Controllers.Common.ChannelAccess.ChannelAccessApplicationResponse
 */
export interface ChannelAccessApplication {
  id: number;
  configId: number;
  channelId: bigint;
  userId: bigint;
  username: string | null;
  avatarUrl: string | null;
  status: AccessApplicationStatus;
  expiresAt: string | null;
  resolvedAt: string | null;
  resolvedBy: bigint | null;
  resolutionReason: string | null;
  createdAt: string | null;
  approvals: number;
  denials: number;
  abstains: number;
  answers: ChannelAccessAnswer[];
  votes: ChannelAccessVote[];
}

/**
 * A user barred from applying.
 * Maps to Mewdeko.Controllers.Common.ChannelAccess.ChannelAccessBlacklistResponse
 */
export interface ChannelAccessBlacklistEntry {
  id: number;
  userId: bigint;
  username: string | null;
  configId: number | null;
  reason: string | null;
  addedBy: bigint;
  addedAt: string | null;
}

/**
 * Request body to open applications on a locked channel.
 * Maps to Mewdeko.Controllers.Common.ChannelAccess.CreateChannelAccessGateRequest
 */
export interface CreateChannelAccessGateRequest {
  channelId: bigint;
  /** Leave null to add approved applicants to the channel individually. */
  accessRoleId: bigint | null;
  userId: bigint;
}

/**
 * Request body to change a gate's settings. Omitted fields are left alone, and
 * zero clears an optional channel or role.
 * Maps to Mewdeko.Controllers.Common.ChannelAccess.UpdateChannelAccessGateRequest
 */
export interface UpdateChannelAccessGateRequest {
  /** Zero switches the gate to adding applicants directly. */
  accessRoleId?: bigint;
  reviewChannelId?: bigint;
  logChannelId?: bigint;
  voterRoleId?: bigint;
  pingRoleId?: bigint;
  enabled?: boolean;
  requiredApprovals?: number;
  requiredDenials?: number;
  voteDurationHours?: number;
  onExpiry?: AccessExpiryBehavior;
  allowAbstain?: boolean;
  anonymousVotes?: boolean;
  anonymousApplicant?: boolean;
  minAccountAgeDays?: number;
  minServerAgeDays?: number;
  reapplyCooldownHours?: number;
  dmOnDecision?: boolean;
}

/**
 * Request body to add a question to a gate's application form.
 * Maps to Mewdeko.Controllers.Common.ChannelAccess.CreateChannelAccessQuestionRequest
 */
export interface CreateChannelAccessQuestionRequest {
  question: string;
  placeholder?: string | null;
  required: boolean;
  paragraph: boolean;
}

/**
 * Request body to close an application from the dashboard.
 * Maps to Mewdeko.Controllers.Common.ChannelAccess.ResolveChannelAccessApplicationRequest
 */
export interface ResolveChannelAccessApplicationRequest {
  status: AccessApplicationStatus.Approved | AccessApplicationStatus.Denied;
  userId: bigint;
  reason?: string | null;
}

/**
 * Request body to bar a user from applying.
 * Maps to Mewdeko.Controllers.Common.ChannelAccess.CreateChannelAccessBlacklistRequest
 */
export interface CreateChannelAccessBlacklistRequest {
  userId: bigint;
  configId?: number | null;
  addedBy: bigint;
  reason?: string | null;
}
