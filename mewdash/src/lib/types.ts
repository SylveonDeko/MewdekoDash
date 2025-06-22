// lib/types.ts

// --- General Purpose Types ---
export interface Giveaways {
  id: number;
  when: string;
  channelId: BigInt;
  serverId: BigInt;
  ended: number;
  messageId: BigInt;
  winners: number;
  userId: BigInt;
  messageCountReq: BigInt | null;
  item: string | null;
  restrictTo: string | null;
  blacklistUsers: string | null;
  blacklistRoles: string | null;
  emote: string | null;
  useButton: boolean;
  useCaptcha: boolean;
}

export interface PermissionOverride {
  perm: bigint;
  guildId: bigint;
  command: string;
  id: number;
  dateAdded: string;
}

// --- Ticketing System Types (Unchanged) ---
// These types were not part of the query and remain as they were.
export interface TicketPanel {
  id: bigint;
  messageId: bigint;
  guildId: bigint;
  channelId: string;
  title: string;
  description: string;
  color: string;
  embedTitle: string;
  embedDescription: string;
  buttonCount: number;
  selectMenuCount: number;
  isActive: boolean;
}

// ... other ticketing types

// --- Patreon Integration Types (Verified & Corrected) ---

/**
 * Response from the backend for generating a Patreon OAuth URL.
 */
export interface PatreonOAuthResponse {
  authorizationUrl: string;
  state: string;
}

/**
 * Response from the backend after a successful Patreon OAuth callback.
 */
export interface PatreonOAuthCallbackResponse {
  success: boolean;
  message: string;
  guildId: bigint;
  campaignId?: string;
}

/**
 * Response from the backend detailing the current OAuth status for a guild.
 */
export interface PatreonOAuthStatusResponse {
  isConfigured: boolean;
  campaignId?: string;
  lastSync?: string;
  tokenExpiry?: string;
}

/**
 * Request model for updating Patreon configuration settings.
 */
export interface PatreonConfigUpdateRequest {
  channelId?: bigint;
  message?: string;
  announcementDay?: number;
  toggleAnnouncements?: boolean;
  toggleRoleSync?: boolean;
}

/**
 * Request model for triggering manual Patreon operations.
 */
export interface PatreonOperationRequest {
  operation: string;
}

/**
 * Request model for mapping a Patreon tier to a Discord role.
 */
export interface PatreonTierMappingRequest {
  tierId: string;
  roleId: bigint;
}

/**
 * Represents the Patreon configuration for a guild as returned by the backend.
 */
export interface PatreonConfig {
  channelId: bigint | null;
  message: string | null;
  announcementDay: number;
  enabled: boolean;
  lastAnnouncement: string | null;
}

/**
 * Detailed analytics for a guild's Patreon campaign, matching the C# backend model.
 */
export interface PatreonAnalytics {
  totalSupporters: number;
  activeSupporters: number;
  formerSupporters: number;
  linkedSupporters: number;
  totalMonthlyRevenue: number;
  averageSupport: number;
  lifetimeRevenue: number;
  newSupportersThisMonth: number;
  tierDistribution: Record<string, number>;
  topSupporters: TopSupporter[];
}

/**
 * Represents a top supporter for the analytics overview.
 */
export interface TopSupporter {
  name: string;
  amount: number;
  isLinked: boolean;
}

/**
 * Represents a Patreon supporter as stored in the database and returned by the API.
 */
export interface PatreonSupporter {
  id: number;
  guildId: string; // serialized ulong
  patreonUserId: string;
  discordUserId: string; // serialized ulong
  fullName: string;
  email: string | null;
  tierId: string | null;
  amountCents: number;
  patronStatus: string;
  pledgeRelationshipStart: string | null; // serialized DateTime?
  lastChargeDate: string | null; // serialized DateTime?
  lastChargeStatus: string | null;
  lifetimeAmountCents: number;
  currentlyEntitledAmountCents: number;
  lastUpdated: string; // serialized DateTime
}

/**
 * Represents a Patreon tier as stored in the database and returned by the API.
 */
export interface PatreonTier {
  id: number;
  guildId: string; // serialized ulong
  tierId: string;
  title: string;
  amountCents: number;
  description: string | null;
  discordRoleId: string; // serialized ulong
  isActive: boolean;
  lastUpdated: string; // serialized DateTime
}

/**
 * Represents a Patreon goal as stored in the database and returned by the API.
 */
export interface PatreonGoal {
  id: number;
  guildId: string; // serialized ulong
  goalId: string;
  title: string;
  amountCents: number;
  description: string | null;
  reachedAt: string | null; // serialized DateTime?
  isActive: boolean;
}
