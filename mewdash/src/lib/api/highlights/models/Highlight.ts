// lib/api/highlights/models/Highlight.ts

export interface Highlight {
  id: number;
  userId: bigint;
  word: string;
  dateAdded: string | null;
}

export interface HighlightSettings {
  highlightsEnabled: boolean;
  ignoredChannels: string[];
  ignoredUsers: string[];
}
