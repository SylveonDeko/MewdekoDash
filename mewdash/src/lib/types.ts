// lib/types.ts

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

export interface TicketButton {
  id: number;
  panelId: number;
  label: string;
  emoji: string;
  style: number;
  categoryId: string;
  isActive: boolean;
}

export interface TicketSelectMenu {
  id: number;
  panelId: number;
  placeholder: string;
  minValues: number;
  maxValues: number;
  optionCount: number;
}

export interface Ticket {
  id: number;
  channelId: string;
  userId: string;
  claimedBy?: string;
  priority: number;
  tags: string[];
  notes: string;
  isOpen: boolean;
  createdAt: string;
  closedAt?: string;
}

export interface TicketCase {
  id: number;
  title: string;
  description: string;
  priority: number;
  isOpen: boolean;
  createdAt: string;
  ticketCount: number;
}

export interface TicketStats {
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  archivedTickets: number;
  avgResponseTime: string;
  activeStaff: number;
  topCategories: Array<{ name: string; count: number }>;
}

export interface UserTicketStats {
  userId: string;
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  avgResponseTime: string;
}

export interface TicketActivity {
  date: string;
  created: number;
  closed: number;
  responseTime: string;
}

export interface StaffResponseStats {
  staffId: string;
  username: string;
  avgResponseTime: string;
  ticketsHandled: number;
  rating: number;
}

export interface Priority {
  id: number;
  name: string;
  color: string;
  level: number;
}

export interface TicketTag {
  id: number;
  name: string;
  color: string;
}

export interface BlacklistedUser {
  id: string;
  username: string;
  reason: string;
  blacklistedAt: string;
}

export interface Priority {
  id: number;
  name: string;
  color: string;
  level: number;
}

export interface PatreonOAuthResponse {
  authorizationUrl: string;
  state: string;
}

export interface PatreonOAuthCallbackResponse {
  success: boolean;
  message: string;
  guildId: bigint;
  campaignId?: string;
}

export interface PatreonOAuthStatusResponse {
  isConfigured: boolean;
  campaignId?: string;
  lastSync?: string;
  tokenExpiry?: string;
}

export interface PatreonConfigUpdateRequest {
  channelId?: bigint;
  message?: string;
  announcementDay?: number;
  toggleAnnouncements?: boolean;
  toggleRoleSync?: boolean;
}

export interface PatreonOperationRequest {
  operation: string;
}

export interface PatreonTierMappingRequest {
  tierId: string;
  roleId: bigint;
}

export interface PatreonConfig {
  channelId?: bigint;
  message?: string;
  announcementDay?: number;
  announcementsEnabled?: boolean;
  roleSyncEnabled?: boolean;
}

export interface PatreonAnalytics {
  totalSupporters: number;
  totalRevenue: number;
  activeTiers: number;
  recentSupporters: Array<{
    id: string;
    name: string;
    email: string;
    pledgeCents: number;
    tierTitle: string;
    joinedAt: string;
  }>;
  monthlyStats: Array<{
    month: string;
    supporters: number;
    revenue: number;
  }>;
}

export interface PatreonSupporter {
  id: string;
  name: string;
  email: string;
  pledgeCents: number;
  tierTitle: string;
  discordUserId?: string;
  joinedAt: string;
  lastChargeDate?: string;
  lastChargeStatus?: string;
}

export interface PatreonTier {
  id: string;
  title: string;
  description?: string;
  amountCents: number;
  patronCount: number;
  published: boolean;
  imageUrl?: string;
  discordRoleIds?: string;
}

export interface PatreonGoal {
  id: string;
  title: string;
  description?: string;
  amountCents: number;
  completedPercentage: number;
  reachedAt?: string;
}