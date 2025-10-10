// lib/api/starboard/models/Starboard.ts

export interface Starboard {
  id: number;
  guildId: bigint;
  starboardChannelId: bigint;
  emote: string;
  threshold: number;
  checkedChannels: string;
  useBlacklist: boolean;
  allowBots: boolean;
  removeOnDelete: boolean;
  removeOnReactionsClear: boolean;
  removeOnBelowThreshold: boolean;
  repostThreshold: number;
  dateAdded: string | null;
}

export interface StarboardHighlight {
  messageId: bigint;
  channelId: bigint;
  starCount: number;
  content: string;
  authorName: string;
  authorAvatarUrl?: string;
  imageUrl?: string;
  starEmote: string;
  createdAt: string;
}
