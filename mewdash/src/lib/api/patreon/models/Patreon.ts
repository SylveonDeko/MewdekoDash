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
  isConnected: boolean;
  campaignId: string | null;
  creatorName: string | null;
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
  patreonChannelId?: bigint;
  patreonMessage?: string | null;
  patreonAnnouncementDay?: number;
  patreonEnabled?: boolean;
  patreonGoalChannel?: bigint;
  patreonStatsChannel?: bigint;
  patreonRoleSync?: boolean;
}

export interface PatreonTier {
  id: string;
  title: string;
  amountCents: number;
  patronCount: number;
}

export interface PatreonSupporter {
  userId: string;
  fullName: string;
  email: string;
  pledgeAmountCents: number;
  tierTitle: string;
  patronStatus: string;
}

export interface PatreonCreator {
  fullName: string;
  url: string;
  imageUrl: string;
  patronCount: number;
}

export interface PatreonAnalytics {
  totalPatrons: number;
  totalPledgeAmountCents: number;
  tierDistribution: Record<string, number>;
}

export interface PatreonOperationRequest {
  operation: "sync" | "syncRoles" | "announceGoals";
}

export interface PatreonTierMappingRequest {
  tierId: string;
  roleId: bigint;
}
