// lib/api/moderation/models/Warning.ts

export interface Warning {
  id: number;

  guildId: bigint;

  userId: bigint;

  reason: string | null;

  forgiven: boolean;

  forgivenBy: string | null;

  moderator: string | null;

  dateAdded: string | null;
}

export interface WarningPunishment {
  id: number;

  count: number;

  punishment: number;

  punishmentName: string;

  /** Duration in minutes, 0 when permanent */
  time: number;

  roleId: bigint | null;
}

export interface WarnUserRequest {
  moderatorId: bigint;

  reason: string;
}

export interface WarnUserResponse {
  punishmentApplied: boolean;

  punishment: string | null;
}

export interface SetWarnPunishmentRequest {
  count: number;

  punishment: number;

  timeMinutes?: number | null;

  roleId?: bigint | null;
}
