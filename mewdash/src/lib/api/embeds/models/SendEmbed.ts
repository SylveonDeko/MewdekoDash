// lib/api/embeds/models/SendEmbed.ts

/**
 * A channel the embed builder may target, with the effective Discord permissions the requesting user
 * and the bot each hold in it. Channels the user cannot see are never returned by the bot.
 * Maps to Mewdeko.Controllers.Common.Embeds.SendableChannelResponse
 */
export interface SendableChannel {
  id: bigint;
  name: string;
  categoryId: bigint | null;
  categoryName: string | null;
  position: number;
  isThread: boolean;
  isAnnouncement: boolean;
  canSend: boolean;
  canEmbed: boolean;
  canMentionEveryone: boolean;
  canUseWebhooks: boolean;
  botCanSend: boolean;
  botCanEmbed: boolean;
  botCanUseWebhooks: boolean;
  restriction: string | null;
}

/**
 * Request body for sending a built message to a guild channel.
 * Maps to Mewdeko.Controllers.Common.Embeds.SendEmbedRequest
 */
export interface SendEmbedRequest {
  userId: bigint;
  channelId: bigint;
  jsonCode: string;
  useWebhook: boolean;
  /** A saved persona to send as. Supplies the name and avatar, overriding the ad-hoc fields below. */
  personaId?: number | null;
  webhookUsername?: string | null;
  webhookAvatarUrl?: string | null;
}

/**
 * Details of a message the embed builder sent.
 * Maps to Mewdeko.Controllers.Common.Embeds.SendEmbedResponse
 */
export interface SendEmbedResult {
  messageId: bigint;
  channelId: bigint;
  channelName: string;
  messageLink: string;
  sentViaWebhook: boolean;
  webhookUsername: string | null;
  personaName: string | null;
  mentionsSuppressed: boolean;
}
