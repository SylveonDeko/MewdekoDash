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

export interface RoleRewardRequest {
  roleId: bigint;
  repRequired: number;
  removeOnDrop: boolean;
  announceChannelId?: bigint | null;
  announceDM: boolean;
  xpReward: number;
}
