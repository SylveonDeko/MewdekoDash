export type TwitchOAuthMode = "bot" | "channel";

export interface TwitchOAuthResponse {
  authorizationUrl: string;
  state: string;
  mode: TwitchOAuthMode;
}

export interface TwitchOAuthCallbackResponse {
  success: boolean;
  message: string;
  guildId: bigint;
  mode: TwitchOAuthMode;
  twitchUserId: string | null;
  twitchUsername: string | null;
  displayName: string | null;
}

export interface TwitchOAuthStatusResponse {
  isConfigured: boolean;
  hasBotAccount: boolean;
  hasChannelAuthorization: boolean;
  useEventSub: boolean;
  botUsername: string | null;
  botDisplayName: string | null;
  channelUsername: string | null;
  channelDisplayName: string | null;
  twitchUserId: string | null;
  commandPrefix: string | null;
  language: string | null;
  goLiveChannelId: bigint | null;
  goLiveMessage: string | null;
  subNotificationChannelId: bigint | null;
  subNotificationMessage: string | null;
  raidNotificationChannelId: bigint | null;
  raidNotificationMessage: string | null;
  botTokenExpiry: string | null;
  channelTokenExpiry: string | null;
  lastAuthorizedAt: string | null;
  lastEventAt: string | null;
}

export interface TwitchConfigUpdateRequest {
  twitchChannel?: string | null;
  commandPrefix?: string | null;
  enabled?: boolean;
  useEventSub?: boolean;
  language?: string | null;
  goLiveChannelId?: bigint | null;
  goLiveMessage?: string | null;
  subNotificationChannelId?: bigint | null;
  subNotificationMessage?: string | null;
  raidNotificationChannelId?: bigint | null;
  raidNotificationMessage?: string | null;
}

export interface TwitchConfigResponse {
  guildId: bigint;
  twitchChannel: string;
  commandPrefix: string;
  enabled: boolean;
  useEventSub: boolean;
  language: string | null;
  goLiveChannelId: bigint | null;
  goLiveMessage: string | null;
  subNotificationChannelId: bigint | null;
  subNotificationMessage: string | null;
  raidNotificationChannelId: bigint | null;
  raidNotificationMessage: string | null;
  twitchUserId: string | null;
  twitchDisplayName: string | null;
  lastAuthorizedAt: string | null;
  lastEventAt: string | null;
}

export interface TwitchAccountLinkResponse {
  discordUserId: bigint;
  twitchUsername: string;
}

export interface TwitchAccountLinkRequest {
  discordUserId: bigint;
  twitchUsername: string;
}

export interface TwitchChatCommandResponse {
  name: string;
  permission: string;
}

export interface TwitchCustomCommandResponse {
  id: number;
  name: string;
  response: string;
  permission: string;
  cooldownSeconds: number;
  enabled: boolean;
  useCount: number;
  lastUsedAt: string | null;
  lastUpdatedAt: string | null;
}

export interface TwitchCustomCommandRequest {
  name: string;
  response: string;
  permission: string;
  cooldownSeconds: number;
  enabled: boolean;
}

export interface TwitchCommandPreviewRequest {
  name: string;
  args?: string | null;
}

export interface TwitchCommandPreviewResponse {
  response: string;
}

export interface TwitchRedemptionActionResponse {
  id: number;
  rewardTitle: string;
  twitchResponse: string | null;
  discordChannelId: bigint | null;
  discordMessage: string | null;
  enabled: boolean;
  lastUpdatedAt: string | null;
}

export interface TwitchRedemptionActionRequest {
  rewardTitle: string;
  twitchResponse?: string | null;
  discordChannelId?: bigint | null;
  discordMessage?: string | null;
}

export interface TwitchEventHistoryResponse {
  id: number;
  eventType: string;
  source: string;
  succeeded: boolean;
  message: string;
  error: string | null;
  rawPayload: string | null;
  dateAdded: string;
}

export interface TwitchQuoteResponse {
  id: number;
  text: string;
  author: string | null;
  addedBy: string | null;
  dateAdded: string;
}

export interface TwitchQuoteRequest {
  text: string;
  author?: string | null;
  addedBy?: string | null;
}

export interface TwitchEventSubSubscriptionHealthResponse {
  twitchSubscriptionId: string;
  type: string;
  status: string;
  sessionId: string | null;
  lastUpdatedAt: string;
}

export interface TwitchHealthResponse {
  hasConfig: boolean;
  enabled: boolean;
  twitchChannel: string | null;
  eventSubEnabled: boolean;
  hasBotAccount: boolean;
  hasChannelAuthorization: boolean;
  botMissingScopes: string[];
  channelMissingScopes: string[];
  botTokenExpiresAt: string | null;
  channelTokenExpiresAt: string | null;
  lastEventAt: string | null;
  subscriptions: TwitchEventSubSubscriptionHealthResponse[];
}

export interface TwitchVariableDocsResponse {
  groups: Record<string, string[]>;
}

export interface TwitchChatSendRequest {
  message: string;
}

export interface TwitchMarkerRequest {
  description?: string | null;
}

export interface TwitchPollRequest {
  title: string;
  choices: string[];
  durationSeconds: number;
}

export interface TwitchModerationRequest {
  username: string;
  durationSeconds?: number | null;
  reason?: string | null;
}

export interface TwitchDeleteMessageRequest {
  messageId: string;
}

export interface TwitchActionResponse {
  success: boolean;
  message: string;
  url: string | null;
}

export interface TwitchTimerResponse {
  id: number;
  name: string;
  messages: string;
  intervalMinutes: number;
  minChatMessages: number;
  onlineOnly: boolean;
  randomizeMessages: boolean;
  enabled: boolean;
  lastSentAt: string | null;
  lastUpdatedAt: string | null;
}

export interface TwitchTimerRequest {
  name: string;
  messages: string;
  intervalMinutes: number;
  minChatMessages: number;
  onlineOnly: boolean;
  randomizeMessages: boolean;
  enabled: boolean;
}

export interface TwitchTimerStateRequest {
  enabled: boolean;
}

export interface TwitchTimerTestResponse {
  message: string;
}
