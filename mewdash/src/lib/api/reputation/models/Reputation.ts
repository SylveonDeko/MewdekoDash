// lib/api/reputation/models/Reputation.ts

export interface RepConfig {
  guildId: bigint;
  enabled: boolean;
  defaultCooldownMinutes: number;
  dailyLimit: number;
  weeklyLimit: number | null;
  minAccountAgeDays: number;
  minServerMembershipHours: number;
  minMessageCount: number;
  enableNegativeRep: boolean;
  enableAnonymous: boolean;
  enableDecay: boolean;
  decayType: string;
  decayAmount: number;
  decayInactiveDays: number;
  notificationChannel: bigint | null;
}

export interface RoleReward {
  roleId: bigint;
  roleName: string;
  repRequired: number;
  removeOnDrop: boolean;
  announceChannel: bigint | null;
  announceDM: boolean;
  xpReward: number | null;
}

export interface RepLeaderboardEntry {
  rank: number;
  userId: bigint;
  username: string;
  reputation: number;
}

export interface RepHistoryEntry {
  id: number;
  giverId: bigint;
  amount: number;
  repType: string;
  reason: string | null;
  isAnonymous: boolean;
  timestamp: string;
}

export interface RepStats {
  totalUsers: number;
  totalRepGiven: number;
  totalTransactions: number;
  averageRepPerUser: number;
  recentActivity: Array<{
    fromUserId: bigint;
    toUserId: bigint;
    amount: number;
    timestamp: string;
    reason: string | null;
  }>;
  topGivers: Array<{ userId: bigint; totalGiven: number }>;
}

export interface DecaySettingsRequest {
  enabled: boolean;
  type?: string | null;
  amount?: number | null;
  inactiveDays?: number | null;
}

export interface ReactionRule {
  emoji: string;
  emojiName: string;
  emojiId: bigint | null;
  amount: number;
  repType: string;
}

export interface ReactionRuleRequest {
  emoji: string;
  amount: number;
  repType: string;
}

export interface CustomRepType {
  typeName: string;
  displayName: string;
}

export interface RoleRewardRequest {
  roleId: bigint;
  repRequired: number;
  removeOnDrop: boolean;
  announceChannelId?: bigint | null;
  announceDM: boolean;
  xpReward: number;
}
