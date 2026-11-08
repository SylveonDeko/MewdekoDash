// lib/api/greetmessages/greetmessages.ts
import { apiRequest } from "../core";
import type { GreetMessage, GreetMessageKind } from "./models";

/**
 * Goodbye, DM welcome and boost messages API
 * Maps to Mewdeko.Controllers.GreetMessagesController
 */
export const greetMessagesApi = {
  /** Gets one message */
  get: (guildId: bigint, kind: GreetMessageKind) =>
    apiRequest<GreetMessage>(`GreetMessages/${guildId}/${kind}`),

  /** Saves every field of one message and returns the saved state */
  update: (guildId: bigint, kind: GreetMessageKind, message: GreetMessage) =>
    apiRequest<GreetMessage>(`GreetMessages/${guildId}/${kind}`, "POST", message),
};
