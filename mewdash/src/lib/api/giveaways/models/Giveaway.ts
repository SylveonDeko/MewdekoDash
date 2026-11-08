// lib/api/giveaways/models/Giveaway.ts

export interface Giveaway {
  id: number;
  when: string;
  channelId: bigint;
  serverId: bigint;
  /** 0 running, 1 ended, 2 draft */
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
  /** Space separated roleId:extraEntries pairs */
  extraEntryRoles: string | null;
  /** 0 none, 1 xp, 2 coins */
  prizeType: number;
  prizeAmount: number | bigint;
  /** How long a draft runs once started */
  draftDurationSeconds: number;
}

export interface GiveawaySettings {
  emote: string | null;
  pingRole: bigint;
  banner: string | null;
  embedColor: string | null;
  dmOnWin: boolean;
  endMessage: string | null;
}

export interface GiveawayOptions {
  extraEntryRoles: string | null;
  prizeType: number;
  prizeAmount: number;
}
