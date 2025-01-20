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
