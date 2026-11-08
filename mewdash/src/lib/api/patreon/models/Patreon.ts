// lib/api/patreon/models/Patreon.ts

export interface PatreonOAuthResponse {
  authorizationUrl: string;
  state: string;
}

export interface PatreonOAuthCallbackResponse {
  success: boolean;
  message: string;
  guildId: bigint;
  campaignId: string;
}

export interface PatreonOAuthStatusResponse {
  isConfigured: boolean;
  campaignId: string | null;
  lastSync: string | null;
  tokenExpiry: string | null;
}

export interface PatreonConfig {
  guildId: bigint;
  patreonChannelId: bigint;
  patreonMessage: string | null;
  patreonAnnouncementDay: number;
  patreonEnabled: boolean;
  patreonGoalChannel: bigint;
  patreonStatsChannel: bigint;
  patreonRoleSync: boolean;
}

export interface PatreonConfigUpdateRequest {
  channelId?: bigint;
  message?: string | null;
  announcementDay?: number;
  toggleAnnouncements?: boolean;
  toggleRoleSync?: boolean;
  /** Sets announcements on or off, applied after the channel. */
  announcementsEnabled?: boolean;
  /** Sets role sync on or off. */
  roleSyncEnabled?: boolean;
}

export interface PatreonTier {
  id: number;
  guildId: bigint;
  tierId: string;
  tierTitle: string;
  amountCents: number;
  /** 0 when no role is mapped. */
  discordRoleId: bigint;
  description: string | null;
  dateAdded: string;
  isActive: boolean;
}

export interface PatreonSupporterLinkRequest {
  patreonUserId: string;
  /** 0 unlinks the supporter. */
  discordUserId: bigint;
}

export interface PatreonSupporter {
  id: number;
  guildId: bigint;
  patreonUserId: string;
  discordUserId: bigint;
  fullName: string;
  email: string | null;
  tierId: string | null;
  amountCents: number;
  patronStatus: string | null;
  pledgeRelationshipStart: string | null;
  lastChargeDate: string | null;
  lastChargeStatus: string | null;
  lifetimeAmountCents: number;
  currentlyEntitledAmountCents: number;
  lastUpdated: string;
}

export interface PatreonCreator {
  fullName: string;
  url: string;
  imageUrl: string;
  patronCount: number;
}

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
  topSupporters: Array<{
    name: string;
    amount: number;
    isLinked: boolean;
    tier?: string | null;
  }>;
}

export interface PatreonOperationRequest {
  operation: string;
}

export interface PatreonTierMappingRequest {
  tierId: string;
  roleId: bigint;
}
