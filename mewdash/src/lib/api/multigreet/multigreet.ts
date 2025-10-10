// lib/api/multigreet/multigreet.ts
import { apiRequest } from "../core";
import type { MultiGreet, MultiGreetType } from "./models";

export const multiGreetApi = {
  getMultiGreets: (guildId: bigint) =>
    apiRequest<MultiGreet[]>(`multigreet/${guildId}`),

  addMultiGreet: (guildId: bigint, channelId: bigint) =>
    apiRequest<void>(`multigreet/${guildId}`, "POST", channelId),

  removeMultiGreet: (guildId: bigint, greetId: number) =>
    apiRequest<void>(`multigreet/${guildId}/${greetId}`, "DELETE"),

  updateMultiGreetMessage: (
    guildId: bigint,
    greetId: number,
    message: string,
  ) =>
    apiRequest<void>(
      `multigreet/${guildId}/${greetId}/message`,
      "PUT",
      message,
    ),

  updateMultiGreetDeleteTime: (
    guildId: bigint,
    greetId: number,
    time: string,
  ) =>
    apiRequest<void>(
      `multigreet/${guildId}/${greetId}/delete-time`,
      "PUT",
      time,
    ),

  updateMultiGreetGreetBots: (
    guildId: bigint,
    greetId: number,
    enabled: boolean,
  ) =>
    apiRequest<void>(
      `multigreet/${guildId}/${greetId}/greet-bots`,
      "PUT",
      enabled,
    ),

  updateMultiGreetWebhook: (
    guildId: bigint,
    greetId: number,
    webhook: { name: string | null; avatarUrl?: string },
  ) =>
    apiRequest<void>(
      `multigreet/${guildId}/${greetId}/webhook`,
      "PUT",
      webhook,
    ),

  updateMultiGreetDisabled: (
    guildId: bigint,
    greetId: number,
    disabled: boolean,
  ) =>
    apiRequest<void>(
      `multigreet/${guildId}/${greetId}/disable`,
      "PUT",
      disabled,
    ),

  getMultiGreetType: (guildId: bigint) =>
    apiRequest<MultiGreetType>(`multigreet/${guildId}/type`),

  setMultiGreetType: (guildId: bigint, type: MultiGreetType) =>
    apiRequest<void>(`multigreet/${guildId}/type`, "PUT", type.valueOf()),
};
