import { apiRequest } from "../core";
import type {
  TwitchAccountLinkRequest,
  TwitchAccountLinkResponse,
  TwitchActionResponse,
  TwitchChatCommandResponse,
  TwitchChatSendRequest,
  TwitchCommandPreviewRequest,
  TwitchCommandPreviewResponse,
  TwitchConfigResponse,
  TwitchConfigUpdateRequest,
  TwitchCustomCommandRequest,
  TwitchCustomCommandResponse,
  TwitchDeleteMessageRequest,
  TwitchEventHistoryResponse,
  TwitchHealthResponse,
  TwitchMarkerRequest,
  TwitchModerationRequest,
  TwitchOAuthCallbackResponse,
  TwitchOAuthMode,
  TwitchOAuthResponse,
  TwitchOAuthStatusResponse,
  TwitchPollRequest,
  TwitchQuoteRequest,
  TwitchQuoteResponse,
  TwitchRedemptionActionRequest,
  TwitchRedemptionActionResponse,
  TwitchTimerRequest,
  TwitchTimerResponse,
  TwitchTimerStateRequest,
  TwitchTimerTestResponse,
  TwitchVariableDocsResponse,
} from "./models";

export const twitchApi = {
  getOAuthUrl: (guildId: bigint, mode: TwitchOAuthMode) =>
    apiRequest<TwitchOAuthResponse>(
      `twitch/oauth/url?guildId=${guildId}&mode=${encodeURIComponent(mode)}`,
    ),

  handleOAuthCallback: (code: string, state: string, error?: string) => {
    const errorQs = error ? `&error=${encodeURIComponent(error)}` : "";
    return apiRequest<TwitchOAuthCallbackResponse>(
      `twitch/oauth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}${errorQs}`,
    );
  },

  getOAuthStatus: (guildId: bigint) =>
    apiRequest<TwitchOAuthStatusResponse>(`twitch/oauth/status?guildId=${guildId}`),

  getConfig: (guildId: bigint) =>
    apiRequest<TwitchConfigResponse>(`twitch/config?guildId=${guildId}`),

  updateConfig: (guildId: bigint, config: TwitchConfigUpdateRequest) =>
    apiRequest<TwitchConfigResponse>(`twitch/config?guildId=${guildId}`, "POST", config),

  disconnect: (guildId: bigint, mode: TwitchOAuthMode) =>
    apiRequest<{ message: string }>(
      `twitch/oauth/disconnect?guildId=${guildId}&mode=${encodeURIComponent(mode)}`,
      "DELETE",
    ),

  getChatCommands: () =>
    apiRequest<TwitchChatCommandResponse[]>(`twitch/chat-commands`),

  getCustomCommands: (guildId: bigint) =>
    apiRequest<TwitchCustomCommandResponse[]>(`twitch/custom-commands?guildId=${guildId}`),

  saveCustomCommand: (guildId: bigint, request: TwitchCustomCommandRequest) =>
    apiRequest<TwitchCustomCommandResponse>(`twitch/custom-commands?guildId=${guildId}`, "POST", request),

  removeCustomCommand: (guildId: bigint, name: string) =>
    apiRequest<{ removed: boolean }>(
      `twitch/custom-commands?guildId=${guildId}&name=${encodeURIComponent(name)}`,
      "DELETE",
    ),

  previewCustomCommand: (guildId: bigint, request: TwitchCommandPreviewRequest) =>
    apiRequest<TwitchCommandPreviewResponse>(
      `twitch/custom-commands/preview?guildId=${guildId}`,
      "POST",
      request,
    ),

  getRedemptionActions: (guildId: bigint) =>
    apiRequest<TwitchRedemptionActionResponse[]>(`twitch/redemptions?guildId=${guildId}`),

  saveRedemptionAction: (guildId: bigint, request: TwitchRedemptionActionRequest) =>
    apiRequest<TwitchRedemptionActionResponse>(`twitch/redemptions?guildId=${guildId}`, "POST", request),

  removeRedemptionAction: (guildId: bigint, rewardTitle: string) =>
    apiRequest<{ removed: boolean }>(
      `twitch/redemptions?guildId=${guildId}&rewardTitle=${encodeURIComponent(rewardTitle)}`,
      "DELETE",
    ),

  sendTestEvent: (guildId: bigint, eventType: "golive" | "sub" | "raid") =>
    apiRequest<{ message: string }>(`twitch/test/${eventType}?guildId=${guildId}`, "POST"),

  getEventHistory: (guildId: bigint, limit = 50) =>
    apiRequest<TwitchEventHistoryResponse[]>(`twitch/event-history?guildId=${guildId}&limit=${limit}`),

  getHealth: (guildId: bigint) =>
    apiRequest<TwitchHealthResponse>(`twitch/health?guildId=${guildId}`),

  getVariables: () =>
    apiRequest<TwitchVariableDocsResponse>(`twitch/variables`),

  getQuotes: (guildId: bigint, search = "", limit = 50) =>
    apiRequest<TwitchQuoteResponse[]>(
      `twitch/quotes?guildId=${guildId}&search=${encodeURIComponent(search)}&limit=${limit}`,
    ),

  addQuote: (guildId: bigint, request: TwitchQuoteRequest) =>
    apiRequest<TwitchQuoteResponse>(`twitch/quotes?guildId=${guildId}`, "POST", request),

  removeQuote: (guildId: bigint, quoteId: number) =>
    apiRequest<{ removed: boolean }>(`twitch/quotes?guildId=${guildId}&quoteId=${quoteId}`, "DELETE"),

  sendChatMessage: (guildId: bigint, request: TwitchChatSendRequest) =>
    apiRequest<TwitchActionResponse>(`twitch/chat/send?guildId=${guildId}`, "POST", request),

  createMarker: (guildId: bigint, request: TwitchMarkerRequest) =>
    apiRequest<TwitchActionResponse>(`twitch/marker?guildId=${guildId}`, "POST", request),

  createClip: (guildId: bigint) =>
    apiRequest<TwitchActionResponse>(`twitch/clip?guildId=${guildId}`, "POST"),

  createPoll: (guildId: bigint, request: TwitchPollRequest) =>
    apiRequest<TwitchActionResponse>(`twitch/poll?guildId=${guildId}`, "POST", request),

  moderateUser: (guildId: bigint, request: TwitchModerationRequest) =>
    apiRequest<TwitchActionResponse>(`twitch/moderation/ban?guildId=${guildId}`, "POST", request),

  unmoderateUser: (guildId: bigint, request: TwitchModerationRequest) =>
    apiRequest<TwitchActionResponse>(`twitch/moderation/unban?guildId=${guildId}`, "POST", request),

  deleteChatMessage: (guildId: bigint, request: TwitchDeleteMessageRequest) =>
    apiRequest<TwitchActionResponse>(`twitch/moderation/delete-message?guildId=${guildId}`, "POST", request),

  getTimers: (guildId: bigint) =>
    apiRequest<TwitchTimerResponse[]>(`twitch/timers?guildId=${guildId}`),

  saveTimer: (guildId: bigint, request: TwitchTimerRequest) =>
    apiRequest<TwitchTimerResponse>(`twitch/timers?guildId=${guildId}`, "POST", request),

  setTimerState: (guildId: bigint, name: string, request: TwitchTimerStateRequest) =>
    apiRequest<{ updated: boolean }>(
      `twitch/timers/state?guildId=${guildId}&name=${encodeURIComponent(name)}`,
      "POST",
      request,
    ),

  removeTimer: (guildId: bigint, name: string) =>
    apiRequest<{ removed: boolean }>(
      `twitch/timers?guildId=${guildId}&name=${encodeURIComponent(name)}`,
      "DELETE",
    ),

  testTimer: (guildId: bigint, name: string) =>
    apiRequest<TwitchTimerTestResponse>(
      `twitch/timers/test?guildId=${guildId}&name=${encodeURIComponent(name)}`,
      "POST",
    ),

  getLinks: (guildId: bigint) =>
    apiRequest<TwitchAccountLinkResponse[]>(`twitch/links?guildId=${guildId}`),

  createLink: (guildId: bigint, request: TwitchAccountLinkRequest) =>
    apiRequest<TwitchAccountLinkResponse>(`twitch/links?guildId=${guildId}`, "POST", request),

  removeLink: (guildId: bigint, discordUserId: bigint) =>
    apiRequest<{ message: string }>(
      `twitch/links?guildId=${guildId}&discordUserId=${discordUserId}`,
      "DELETE",
    ),
};
