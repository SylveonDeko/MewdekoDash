// lib/api/serverstats/models/ServerStats.ts

/** Which activity a ranking measures. Mirrors StatKind (numeric on the wire). */
export const StatKind = {
  Messages: 0,
  Voice: 1,
  Activity: 2,
} as const;
export type StatKindValue = (typeof StatKind)[keyof typeof StatKind];

/** Chart kinds. Mirrors StatChartKind (numeric on the wire). */
export const StatChartKind = {
  Messages: 0,
  Voice: 1,
  Members: 2,
  Status: 3,
  Joins: 4,
  Leaves: 5,
  Growth: 6,
  InVoice: 7,
  Activities: 8,
} as const;
export type StatChartKindValue = (typeof StatChartKind)[keyof typeof StatChartKind];

/** Exclusion kinds. Mirrors StatsExclusionKind (numeric on the wire). */
export const StatsExclusionKind = {
  Channel: 0,
  Role: 1,
  User: 2,
} as const;
export type StatsExclusionKindValue = (typeof StatsExclusionKind)[keyof typeof StatsExclusionKind];

/** Activity filter mode. Mirrors ActivityFilterMode (numeric on the wire). */
export const ActivityFilterMode = {
  Blacklist: 0,
  Whitelist: 1,
} as const;
export type ActivityFilterModeValue = (typeof ActivityFilterMode)[keyof typeof ActivityFilterMode];

/** Voice state flags that can be left out of voice time. Mirrors VoiceStateFlags. */
export const VoiceStateFlags = {
  SelfMuted: 1,
  SelfDeafened: 2,
  ServerMuted: 4,
  ServerDeafened: 8,
  Afk: 16,
  Alone: 32,
  Streaming: 64,
  Video: 128,
} as const;

/** A ranked user or channel with a resolved name. */
export interface NamedEntry {
  id: bigint;
  value: number;
  name: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
}

/** A row from a ranking endpoint. */
export interface RankedEntry {
  rank: number;
  entry: NamedEntry;
}

/** Live member and presence counts. */
export interface GuildNow {
  members: number;
  humans: number;
  bots: number;
  online: number;
  idle: number;
  dnd: number;
  offline: number;
  inVoice: number;
}

/** The guild wide overview. */
export interface ServerOverview {
  lookbackDays: number;
  messages: number;
  voiceSeconds: number;
  messageContributors: number;
  voiceContributors: number;
  joins: number;
  leaves: number;
  netGrowth: number;
  topMessageUser: NamedEntry | null;
  topVoiceUser: NamedEntry | null;
  topMessageChannel: NamedEntry | null;
  topVoiceChannel: NamedEntry | null;
  now: GuildNow;
}

/** One member's activity. */
export interface UserActivity {
  userId: bigint;
  lookbackDays: number;
  messages: number;
  voiceSeconds: number;
  messageRank: number | null;
  voiceRank: number | null;
  allTimeMessages: number;
  allTimeVoiceSeconds: number;
  topMessageChannels: NamedEntry[];
  topVoiceChannels: NamedEntry[];
}

/** One channel's activity. */
export interface ChannelActivity {
  channelId: bigint;
  lookbackDays: number;
  messages: number;
  voiceSeconds: number;
  contributors: number;
  topMessageUsers: NamedEntry[];
  topVoiceUsers: NamedEntry[];
}

/** A game or app ranking row. */
export interface ActivityRow {
  rank: number;
  name: string;
  applicationId: bigint | null;
  type: string;
  seconds: number;
  players: number;
  activeNow: number;
}

/** Who plays one game. */
export interface ActivityDetail {
  name: string;
  activeNow: number;
  players: number;
  totalSeconds: number;
  top: RankedEntry[];
}

/** One point of a message or voice series. */
export interface StatSeriesPoint {
  bucket: string;
  value: number;
}

/** One hourly guild snapshot. */
export interface GuildSnapshot {
  timestamp: string;
  members: number;
  humans: number;
  bots: number;
  online: number;
  idle: number;
  dnd: number;
  offline: number;
  inVoice: number;
}

/** Joins and leaves series. */
export interface JoinLeaveSeries {
  joins: StatSeriesPoint[];
  leaves: StatSeriesPoint[];
}

/** Tracking settings. */
export interface ServerStatsSettings {
  guildId: bigint;
  trackVoice: boolean;
  trackSnapshots: boolean;
  messageCooldownSeconds: number;
  defaultLookbackDays: number;
  countBots: boolean;
  voiceStates: number;
  trackActivities: boolean;
  verifyActivities: boolean;
  activityFilterMode: number;
}

/** A partial settings update. */
export interface ServerStatsSettingsRequest {
  trackVoice?: boolean;
  trackSnapshots?: boolean;
  messageCooldownSeconds?: number;
  defaultLookbackDays?: number;
  countBots?: boolean;
  voiceStates?: number;
  trackActivities?: boolean;
  verifyActivities?: boolean;
  activityFilterMode?: ActivityFilterModeValue;
}

/** Exclusions by kind. */
export interface StatsExclusions {
  channels: bigint[];
  roles: bigint[];
  users: bigint[];
}

/** The activity filter. */
export interface ActivityFilters {
  mode: number;
  names: string[];
}
