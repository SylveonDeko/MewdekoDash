// lib/api/wordoftheday/wordoftheday.ts
import { apiRequest } from "../core";
import type {
  WordOfTheDayAddWordRequest,
  WordOfTheDayConfig,
  WordOfTheDayConfigRequest,
  WordOfTheDayHistoryEntry,
  WordOfTheDayPostResult,
  WordOfTheDaySchedule,
  WordOfTheDayScheduleRequest,
  WordOfTheDayWord,
} from "./models";

/**
 * Word of the Day API
 * Maps to Mewdeko.Controllers.WordOfTheDayController
 */
export const wordOfTheDayApi = {
  /**
   * Gets the configuration for a guild
   * @param guildId The guild ID
   */
  getConfig: (guildId: bigint) =>
    apiRequest<WordOfTheDayConfig>(`wordoftheday/${guildId}/config`),

  /**
   * Updates the configuration. Only supplied fields change.
   * @param guildId The guild ID
   * @param config Fields to update
   */
  updateConfig: (guildId: bigint, config: WordOfTheDayConfigRequest) =>
    apiRequest<void>(`wordoftheday/${guildId}/config`, "PUT", config),

  /**
   * Resets configuration, custom words, rules, and history
   * @param guildId The guild ID
   */
  resetConfig: (guildId: bigint) =>
    apiRequest<void>(`wordoftheday/${guildId}/config/reset`, "POST"),

  /**
   * Posts a word immediately
   * @param guildId The guild ID
   * @returns The posted word and whether the template fell back to the default embed
   */
  postNow: (guildId: bigint) =>
    apiRequest<WordOfTheDayPostResult>(`wordoftheday/${guildId}/post`, "POST"),

  /**
   * Lists the custom word pool
   * @param guildId The guild ID
   */
  getWords: (guildId: bigint) =>
    apiRequest<WordOfTheDayWord[]>(`wordoftheday/${guildId}/words`),

  /**
   * Adds a custom word, looking up a definition when none is supplied
   * @param guildId The guild ID
   * @param request The word to add
   */
  addWord: (guildId: bigint, request: WordOfTheDayAddWordRequest) =>
    apiRequest<WordOfTheDayWord>(`wordoftheday/${guildId}/words`, "POST", request),

  /**
   * Removes a custom word
   * @param guildId The guild ID
   * @param word The word to remove
   */
  removeWord: (guildId: bigint, word: string) =>
    apiRequest<void>(`wordoftheday/${guildId}/words/${encodeURIComponent(word)}`, "DELETE"),

  /**
   * Gets recently posted words
   * @param guildId The guild ID
   * @param count Maximum rows, capped at 100
   */
  getHistory: (guildId: bigint, count: number = 30) =>
    apiRequest<WordOfTheDayHistoryEntry[]>(`wordoftheday/${guildId}/history?count=${count}`),

  /**
   * Lists weekday and month rules
   * @param guildId The guild ID
   */
  getSchedule: (guildId: bigint) =>
    apiRequest<WordOfTheDaySchedule[]>(`wordoftheday/${guildId}/schedule`),

  /**
   * Creates or updates a weekday or month rule
   * @param guildId The guild ID
   * @param request The rule
   */
  upsertSchedule: (guildId: bigint, request: WordOfTheDayScheduleRequest) =>
    apiRequest<WordOfTheDaySchedule>(`wordoftheday/${guildId}/schedule`, "PUT", request),

  /**
   * Deletes a weekday or month rule
   * @param guildId The guild ID
   * @param ruleType 0 for weekday, 1 for month
   * @param ruleKey Day of week value or month number
   */
  deleteSchedule: (guildId: bigint, ruleType: number, ruleKey: number) =>
    apiRequest<void>(`wordoftheday/${guildId}/schedule/${ruleType}/${ruleKey}`, "DELETE"),
};
