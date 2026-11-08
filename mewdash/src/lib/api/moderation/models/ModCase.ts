// lib/api/moderation/models/ModCase.ts

/** What a mod case recorded */
export type ModCaseAction =
  | "Warn"
  | "Mute"
  | "Unmute"
  | "Timeout"
  | "Untimeout"
  | "Kick"
  | "Ban"
  | "Softban"
  | "Unban"
  | "HardMute"
  | "RemoveRoles";

export interface ModCase {
  caseNumber: number;

  userId: bigint;

  userName: string;

  moderatorId: bigint;

  moderatorName: string;

  action: ModCaseAction;

  reason: string | null;

  durationSeconds: number | null;

  dateAdded: string;
}

export interface ModCasePage {
  total: number;

  page: number;

  pageSize: number;

  cases: ModCase[];
}

export interface ModCaseFilter {
  userId?: bigint | string | null;

  moderatorId?: bigint | string | null;

  action?: ModCaseAction | null;

  page?: number;

  pageSize?: number;
}

export interface ModLeaderboardEntry {
  moderatorId: bigint;

  moderatorName: string;

  count: number;
}

export interface ModCaseChannels {
  logChannelId: bigint | null;

  reportChannelId: bigint | null;
}

export interface ModNote {
  id: number;

  userId: bigint;

  userName: string;

  moderatorId: bigint;

  moderatorName: string;

  note: string;

  dateAdded: string;
}

export interface ModReasonAlias {
  name: string;

  reason: string;
}

/** Custom punishment DMs by action name, null where the default DM is used */
export type PunishDms = Record<string, string | null>;
