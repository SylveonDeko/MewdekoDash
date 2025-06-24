// lib/types/xp.ts

export interface XpSettings {
  guildId: bigint;
  xpPerMessage: number;
  cooldownSeconds: number;
  excludeChannels: string | null;
  excludeRoles: string | null;
  includeChannels: string | null;
  includeRoles: string | null;
  enabled: boolean;
  serverExcluded: boolean;
  notifyLevelUp: boolean;
  notifyMessage: string | null;
  txtTimeout: number;
  voiceTimeout: number;
  voiceMinutes: number;
  voiceXpMultiplier: number;
  txtMultiplier: number;
}

export interface XpTemplate {
  templateName: string;
  backgroundImageUrl: string | null;
  textColor: string;
  backgroundColor: string;
  levelColor: string;
  xpBarColor: string;
  fontName: string | null;
  fontSize: number;
  showAvatar: boolean;
  showUsername: boolean;
  showLevel: boolean;
  showXp: boolean;
  showRank: boolean;
  customText: string | null;
}

export interface MusicSettings {
  guildId: bigint;
  volume: number;
  musicChannelId: bigint | null;
  autoDisconnect: boolean;
  maxQueueSize: number;
  maxSongLength: number;
  qualityPreset: string;
  autoPlay: boolean;
  defaultVolume: number;
  fairPlay: boolean;
  playerTimeout: number;
  roleRestriction: bigint | null;
  channelRestriction: bigint | null;
}

export interface ClientUserInfo {
  id: bigint;
  username: string;
  discriminator: string;
  avatarUrl: string;
  isBot: boolean;
  joinDate: string;
  roles: Array<{
    id: bigint;
    name: string;
    color: number;
    position: number;
  }>;
}

export interface RoleStateSettings {
  guildId: bigint;
  enabled: boolean;
  clearOnBan: boolean;
  ignoreBots: boolean;
  denyList: string | null;
  channels: string | null;
  roles: string | null;
}

export interface ChatMessage {
  id: bigint;
  content: string;
  authorId: bigint;
  authorUsername: string;
  authorAvatar: string;
  channelId: bigint;
  timestamp: string;
  attachments: Array<{
    id: bigint;
    filename: string;
    url: string;
    proxyUrl: string;
    size: number;
    contentType: string;
  }>;
  embeds: Array<{
    title: string | null;
    description: string | null;
    url: string | null;
    color: number | null;
    timestamp: string | null;
  }>;
}

export interface ChatSaveData {
  guildId: bigint;
  channelId: bigint;
  messages: ChatMessage[];
  totalCount: number;
  fromDate: string | null;
  toDate: string | null;
}