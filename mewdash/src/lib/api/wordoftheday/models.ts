// lib/api/wordoftheday/models.ts

/** Where a guild's daily word is drawn from. */
export enum WordSourceMode {
  Dictionary = 0,
  Custom = 1,
  Mixed = 2,
}

/** Part of speech filter for dictionary words. Zero means any, or inherit on a schedule rule. */
export enum WordPartOfSpeech {
  Any = 0,
  Noun = 1,
  Verb = 2,
  Adjective = 3,
  Adverb = 4,
}

/** Frequency based difficulty filter. Zero means any, or inherit on a schedule rule. */
export enum WordDifficulty {
  Any = 0,
  Common = 1,
  Moderate = 2,
  Rare = 3,
}

/** Calendar unit a schedule rule applies to. */
export enum ScheduleRuleType {
  DayOfWeek = 0,
  Month = 1,
}

/**
 * A guild's Word of the Day configuration
 * Maps to Mewdeko.Controllers.Common.WordOfTheDay.WordOfTheDayConfigResponse
 */
export interface WordOfTheDayConfig {
  /** Channel daily words are posted in */
  channelId: bigint | null;

  /** Whether scheduled posting is on */
  enabled: boolean;

  /** Local hour (0 to 23) posts happen at */
  postHour: number;

  /** IANA timezone name */
  timezone: string;

  /** Role pinged with each post */
  pingRoleId: bigint | null;

  /** Custom message template, or null for the default embed */
  messageTemplate: string | null;

  /** Topic hint for dictionary words */
  topic: string | null;

  /** Part of speech filter */
  partOfSpeech: WordPartOfSpeech;

  /** Difficulty filter */
  difficulty: WordDifficulty;

  /** Word source */
  sourceMode: WordSourceMode;

  /** Guild-local date of the last post */
  lastPostedDate: string | null;

  /** Number of words in the custom pool */
  customWordCount: number;
}

/**
 * Partial update for a guild's configuration. Null or missing fields are left unchanged.
 * Maps to Mewdeko.Controllers.Common.WordOfTheDay.WordOfTheDayConfigRequest
 */
export interface WordOfTheDayConfigRequest {
  /** Channel to post in. Zero clears the channel. */
  channelId?: bigint | null;

  /** Whether scheduled posting is on */
  enabled?: boolean | null;

  /** Local hour (0 to 23) to post at */
  postHour?: number | null;

  /** IANA timezone name */
  timezone?: string | null;

  /** Role to ping. Zero clears the role. */
  pingRoleId?: bigint | null;

  /** Custom message template. Empty string clears it. */
  messageTemplate?: string | null;

  /** Topic hint. Empty string clears it. */
  topic?: string | null;

  /** Part of speech filter */
  partOfSpeech?: WordPartOfSpeech | null;

  /** Difficulty filter */
  difficulty?: WordDifficulty | null;

  /** Word source */
  sourceMode?: WordSourceMode | null;
}

/**
 * A custom word in a guild's pool
 * Maps to Mewdeko.Controllers.Common.WordOfTheDay.WordOfTheDayWordResponse
 */
export interface WordOfTheDayWord {
  id: number;
  word: string;
  partOfSpeech: string | null;
  definition: string | null;
  example: string | null;
  addedBy: bigint;
  timesUsed: number;
  lastUsed: string | null;
  dateAdded: string;
}

/**
 * Request to add a custom word
 * Maps to Mewdeko.Controllers.Common.WordOfTheDay.WordOfTheDayAddWordRequest
 */
export interface WordOfTheDayAddWordRequest {
  word: string;
  /** Optional definition. Looked up automatically when omitted. */
  definition?: string | null;
  addedBy: bigint;
}

/**
 * A previously posted word
 * Maps to Mewdeko.Controllers.Common.WordOfTheDay.WordOfTheDayHistoryResponse
 */
export interface WordOfTheDayHistoryEntry {
  id: number;
  word: string;
  partOfSpeech: string | null;
  definition: string;
  example: string | null;
  phonetic: string | null;
  postedOn: string;
}

/**
 * A weekday or month rule overriding the base filters
 * Maps to Mewdeko.Controllers.Common.WordOfTheDay.WordOfTheDayScheduleResponse
 */
export interface WordOfTheDaySchedule {
  id: number;
  ruleType: ScheduleRuleType;
  /** Day of week (0 Sunday to 6 Saturday) or month number (1 to 12) */
  ruleKey: number;
  topic: string | null;
  /** Part of speech override, or null to inherit */
  partOfSpeech: WordPartOfSpeech | null;
  /** Difficulty override, or null to inherit */
  difficulty: WordDifficulty | null;
}

/**
 * Creates or updates a rule. Null fields leave an existing rule unchanged.
 * Maps to Mewdeko.Controllers.Common.WordOfTheDay.WordOfTheDayScheduleRequest
 */
export interface WordOfTheDayScheduleRequest {
  ruleType: ScheduleRuleType;
  ruleKey: number;
  /** Topic override. Empty string clears the topic on the rule. */
  topic?: string | null;
  /** Zero inherits */
  partOfSpeech?: WordPartOfSpeech | null;
  /** Zero inherits */
  difficulty?: WordDifficulty | null;
}

/** A word the bot just posted via the post-now endpoint. */
export interface WordEntry {
  word: string;
  partOfSpeech: string | null;
  definition: string;
  example: string | null;
  phonetic: string | null;
  isCustom: boolean;
}
