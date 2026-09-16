// lib/api/liveboards/models/LiveBoard.ts

/** What a live board shows. Mirrors LiveBoardKind (numeric on the wire). */
export const LiveBoardKind = {
  InviteLeaderboard: 0,
  MessageLeaderboard: 1,
  VoiceLeaderboard: 2,
  JoinsChart: 3,
  LeavesChart: 4,
  GrowthChart: 5,
  MembersChart: 6,
  MessagesChart: 7,
  ServerOverview: 8,
  InviteStats: 9,
  ActivityLeaderboard: 10,
} as const;
export type LiveBoardKindValue = (typeof LiveBoardKind)[keyof typeof LiveBoardKind];

/** Display labels for board kinds. */
export const liveBoardKindLabels: Record<LiveBoardKindValue, string> = {
  0: "Invite leaderboard",
  1: "Message leaderboard",
  2: "Voice leaderboard",
  3: "Joins chart",
  4: "Leaves chart",
  5: "Growth chart",
  6: "Members chart",
  7: "Messages chart",
  8: "Server overview",
  9: "Invite analytics",
  10: "Top games",
};

/** How often reports post. Mirrors ReportFrequency (numeric on the wire). */
export const ReportFrequency = {
  Daily: 0,
  Weekly: 1,
  Monthly: 2,
} as const;
export type ReportFrequencyValue = (typeof ReportFrequency)[keyof typeof ReportFrequency];

/** A live board. */
export interface LiveBoard {
  id: number;
  channelId: bigint;
  messageId: bigint;
  kind: number;
  range: number;
  pin: boolean;
  entries: number;
  intervalMinutes: number;
  lastUpdateAt: string | null;
}

/** A live board create request. */
export interface LiveBoardRequest {
  channelId: bigint;
  kind: LiveBoardKindValue;
  range: number;
  pin: boolean;
  entries: number;
  intervalMinutes: number;
}

/** Server report settings. */
export interface ServerReportSettings {
  enabled: boolean;
  channelId: bigint | null;
  frequency: number;
  lastSentAt: string | null;
}

/** A server report settings update. */
export interface ServerReportRequest {
  channelId?: bigint;
  clearChannel?: boolean;
  frequency?: ReportFrequencyValue;
  enabled?: boolean;
}
