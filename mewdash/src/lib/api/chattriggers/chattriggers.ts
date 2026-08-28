// lib/api/chattriggers/chattriggers.ts
import { apiRequest } from "../core";
import type { ChatTrigger } from "./models";

/** A named counter that trigger responses read and update. */
export interface TriggerCounter {
  id: number;
  guildId: bigint;
  name: string;
  userId: bigint;
  value: number;
  dateAdded: string | null;
}

/** The outcome of a trigger dry run. */
export interface TriggerTestResult {
  /** Whether the sample message matched the trigger's text, prefix or pattern. */
  matched: boolean;

  /** Why the trigger would not fire, or null when nothing blocks it. */
  blocker: string | null;

  /** Whether the trigger would both match and pass every check. */
  wouldFire: boolean;
}

/** One recorded trigger fire. */
export interface TriggerFire {
  channelId: bigint;
  userId: bigint;
  dateAdded: string | null;
}

/** A trigger's fire history. */
export interface TriggerStats {
  total: number;
  recent: TriggerFire[];
}

/**
 * Chat triggers API
 * Maps to Mewdeko.Controllers.ChatTriggersController
 */
export const chatTriggersApi = {
  /**
   * Gets all chat triggers for a guild
   * @param guildId The guild ID
   * @returns Collection of chat triggers
   */
  getChatTriggers: (guildId: bigint) =>
    apiRequest<ChatTrigger[]>(`chattriggers/${guildId}`),

  /**
   * Updates a chat trigger
   * @param guildId The guild ID
   * @param trigger The updated trigger
   */
  updateChatTrigger: (guildId: bigint, trigger: ChatTrigger) =>
    apiRequest<void>(`chattriggers/${guildId}`, "PATCH", trigger),

  /**
   * Adds a new chat trigger
   * @param guildId The guild ID
   * @param trigger The trigger to add
   * @returns The added trigger with its ID
   */
  addChatTrigger: (guildId: bigint, trigger: Omit<ChatTrigger, "id">) =>
    apiRequest<ChatTrigger>(`chattriggers/${guildId}`, "POST", trigger),

  /**
   * Deletes a chat trigger
   * @param guildId The guild ID
   * @param triggerId The trigger ID to delete
   */
  deleteChatTrigger: (guildId: bigint, triggerId: number) =>
    apiRequest<void>(`chattriggers/${guildId}/${triggerId}`, "DELETE"),

  /**
   * Enables or disables every trigger in a category at once
   * @param guildId The guild ID
   * @param category The category to act on
   * @param disabled Whether the category's triggers should be paused
   * @returns How many triggers changed
   */
  toggleCategory: (guildId: bigint, category: string, disabled: boolean) =>
    apiRequest<{ changed: number }>(`chattriggers/${guildId}/category/toggle`, "POST", {
      category,
      disabled
    }),

  /**
   * Gets the counters chat triggers in this guild read and update
   * @param guildId The guild ID
   * @returns The guild's counters
   */
  getCounters: (guildId: bigint) =>
    apiRequest<TriggerCounter[]>(`chattriggers/${guildId}/counters`),

  /**
   * Sets a counter to an exact value, creating it when it does not exist
   * @param guildId The guild ID
   * @param name The counter name
   * @param value The value to set
   */
  setCounter: (guildId: bigint, name: string, value: number) =>
    apiRequest<void>(`chattriggers/${guildId}/counters`, "POST", { name, value }),

  /**
   * Deletes a counter and every per-user value stored under its name
   * @param guildId The guild ID
   * @param name The counter name
   * @returns How many rows were removed
   */
  deleteCounter: (guildId: bigint, name: string) =>
    apiRequest<{ removed: number }>(
      `chattriggers/${guildId}/counters/${encodeURIComponent(name)}`,
      "DELETE"
    ),

  /**
   * Lists the contextual placeholders available in trigger responses
   * @param guildId The guild ID
   * @returns The available placeholder tokens
   */
  getPlaceholders: (guildId: bigint) =>
    apiRequest<string[]>(`chattriggers/${guildId}/placeholders`),

  /**
   * Dry runs a trigger against a sample message without firing it
   * @param guildId The guild ID
   * @param triggerId The trigger to test
   * @param request The sample message and the member to test as
   * @returns Whether it matched and what blocks it
   */
  testTrigger: (
    guildId: bigint,
    triggerId: number,
    request: { sample: string; userId: string; channelId?: string }
  ) =>
    apiRequest<TriggerTestResult>(`chattriggers/${guildId}/${triggerId}/test`, "POST", {
      sample: request.sample,
      userId: request.userId,
      channelId: request.channelId ?? "0"
    }),

  /**
   * Gets how often a trigger has fired, and its most recent fires
   * @param guildId The guild ID
   * @param triggerId The trigger to read history for
   * @returns The total fires and the most recent ones
   */
  getTriggerStats: (guildId: bigint, triggerId: number) =>
    apiRequest<TriggerStats>(`chattriggers/${guildId}/${triggerId}/stats`)
};
