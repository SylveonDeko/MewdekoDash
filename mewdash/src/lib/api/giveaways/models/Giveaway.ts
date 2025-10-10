// lib/api/giveaways/models/Giveaway.ts

export interface Giveaway {
  id: number;
  when: string;
  channelId: bigint;
  serverId: bigint;
  ended: number;
  messageId: bigint;
  winners: number;
  userId: bigint;
  item: string | null;
  restrictTo: string | null;
  blacklistUsers: string | null;
  blacklistRoles: string | null;
  emote: string | null;
  dateAdded: string | null;
  useButton: boolean;
  useCaptcha: boolean;
  messageCountReq: bigint;
}
