// lib/types/discordGuild.ts
export type DiscordGuild = {
  id: bigint;
  name: string;
  icon: string;
  owner: boolean;
  permissions: number;
  features: string[] | null;
  banner?: string;
  description?: string;
  memberCount?: number;
  premiumTier?: number;
  premiumSubscriptionCount?: number;
};

export type GuildInfo = {
  id: bigint;
  name: string;
  icon?: string;
  iconUrl?: string;
  banner?: string;
  bannerUrl?: string;
  description?: string;
  memberCount: number;
  premiumTier: number;
  ownerId: bigint;
  createdAt: string;
};

export type BasicGuildInfo = {
  id: bigint;
  name: string;
  icon?: string;
  memberCount: number;
  isLarge: boolean;
  features: string[];
};
