// lib/api/votes/models/Vote.ts

export interface VoteRole {
  roleId: bigint;
  roleName: string;
  seconds: number;
}

export interface Vote {
  id: number;
  userId: bigint;
  guildId: bigint;
  botId: bigint;
  dateAdded: string | null;
}

export interface VoteLeaderboardEntry {
  userId: bigint;
  voteCount: number;
}
