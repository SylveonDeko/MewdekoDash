export interface UserHighlight {
  id: number;
  word: string;
  dateAdded: string;
}

export interface HighlightSettings {
  highlightsEnabled: boolean;
  ignoredChannels: string[];
  ignoredUsers: string[];
}

export interface AfkStatus {
  isAfk: boolean;
  message: string;
  when: string | null;
  wasTimed: boolean;
}

export interface AfkRequest {
  message?: string;
  isTimed: boolean;
  until?: string;
}

export interface UserReputation {
  totalRep: number;
  rank: number;
  totalGiven: number;
  totalReceived: number;
  currentStreak: number;
  longestStreak: number;
  lastGivenAt?: string;
  lastReceivedAt?: string;
}

export interface ReputationHistoryEntry {
  amount: number;
  reason: string;
  timestamp: string;
  giverId: bigint;
  giverName: string;
}

export interface UserSettingsResponse {
  highlights: UserHighlight[];
  highlightSettings: HighlightSettings;
  afkStatus: AfkStatus;
  reputation: UserReputation;
}