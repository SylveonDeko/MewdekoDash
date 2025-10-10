// lib/api/protection/models/Protection.ts

export interface AddPatternRequest {
  pattern: string;
  name: string;
  checkUsername: boolean;
  checkDisplayName: boolean;
}

export interface UpdateAntiPatternConfigRequest {
  checkAccountAge?: boolean | null;
  maxAccountAgeMonths?: number | null;
  checkJoinTiming?: boolean | null;
  maxJoinHours?: number | null;
  checkBatchCreation?: boolean | null;
  checkOfflineStatus?: boolean | null;
  checkNewAccounts?: boolean | null;
  newAccountDays?: number | null;
  minimumScore?: number | null;
}

export interface AntiPatternPattern {
  id: number;
  name: string;
  pattern: string;
  checkUsername: boolean;
  checkDisplayName: boolean;
}
