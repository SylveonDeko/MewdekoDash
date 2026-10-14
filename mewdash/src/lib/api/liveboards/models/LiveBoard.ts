import { m } from "$lib/i18n";

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
  get 0() { return m.common.inviteLeaderboard(); },
  get 1() { return m.liveboards.kindLabel1(); },
  get 2() { return m.liveboards.kindLabel2(); },
  get 3() { return m.liveboards.kindLabel3(); },
  get 4() { return m.liveboards.kindLabel4(); },
  get 5() { return m.liveboards.kindLabel5(); },
  get 6() { return m.liveboards.kindLabel6(); },
  get 7() { return m.liveboards.kindLabel7(); },
  get 8() { return m.common.serverOverview(); },
  get 9() { return m.liveboards.kindLabel9(); },
  get 10() { return m.liveboards.kindLabel10(); },
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
