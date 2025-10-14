// lib/api/suggestions/models/Suggestion.ts

/**
 * Suggestion state enum
 */
export enum SuggestionState {
  Suggested = 0,
  Accepted = 1,
  Denied = 2,
  Considered = 3,
  Implemented = 4,
}

/**
 * Suggestion model
 * Maps to DataModel.Suggestion from Database/L2DB/Suggestion.cs
 */
export interface Suggestion {
  /** Primary key */
  id: number;

  /** Guild ID */
  guildId: bigint;

  /** Suggestion ID */
  suggestionId: bigint;

  /** Suggestion text */
  suggestion1: string | null;

  /** Message ID */
  messageId: bigint;

  /** User ID who made the suggestion */
  userId: bigint;

  /** Emote count 1 */
  emoteCount1: number;

  /** Emote count 2 */
  emoteCount2: number;

  /** Emote count 3 */
  emoteCount3: number;

  /** Emote count 4 */
  emoteCount4: number;

  /** Emote count 5 */
  emoteCount5: number;

  /** User who changed the state */
  stateChangeUser: bigint;

  /** State change count */
  stateChangeCount: bigint;

  /** State change message ID */
  stateChangeMessageId: bigint;

  /** Current state (0=Suggested, 1=Accepted, 2=Denied, 3=Considered, 4=Implemented) */
  currentState: number;

  /** Date added */
  dateAdded: string | null;

  /** User data (populated by frontend) */
  user?: {
    username: string;
    avatarUrl: string;
  };
}

/**
 * Suggestion state update request
 * Maps to SuggestStateUpdate in C# controllers
 */
export interface SuggestStateUpdate {
  /** New state */
  state: number;

  /** Reason for state change */
  reason: string | null;

  /** User ID making the change */
  userId: bigint;
}
