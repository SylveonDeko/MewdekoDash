// lib/api/chat/models/ChatModels.ts

/**
 * Chat log embed author
 * Maps to Mewdeko.Controllers.Common.Chat.ChatLogEmbedAuthorDto
 */
export interface ChatLogEmbedAuthor {
  /** The embed author name */
  name: string;

  /** The embed author icon URL */
  iconUrl: string | null;
}

/**
 * Chat log embed
 * Maps to Mewdeko.Controllers.Common.Chat.ChatLogEmbedDto
 */
export interface ChatLogEmbed {
  /** The embed type */
  type: string;

  /** The embed title */
  title: string | null;

  /** The embed description */
  description: string | null;

  /** The embed URL */
  url: string | null;

  /** The embed thumbnail URL */
  thumbnail: string | null;

  /** The embed author information */
  author: ChatLogEmbedAuthor | null;

  fields?: { name: string; value: string; inline?: boolean }[];
}

/**
 * Chat log attachment
 * Maps to Mewdeko.Controllers.Common.Chat.ChatLogAttachmentDto
 */
export interface ChatLogAttachment {
  /** The attachment URL */
  url: string;

  /** The attachment proxy URL */
  proxyUrl: string;

  /** The attachment filename */
  filename: string;

  /** The attachment file size in bytes */
  fileSize: number;
}

/**
 * Chat log author
 * Maps to Mewdeko.Controllers.Common.Chat.ChatLogAuthorDto
 */
export interface ChatLogAuthor {
  /** The Discord user ID */
  id: string;

  /** The username */
  username: string;

  /** The avatar URL */
  avatarUrl: string;
}

/**
 * Chat log message
 * Maps to Mewdeko.Controllers.Common.Chat.ChatLogMessageDto
 */
export interface ChatLogMessage {
  /** The Discord message ID */
  id: string;

  /** The message content */
  content: string;

  /** The message author information */
  author: ChatLogAuthor;

  /** The message timestamp in ISO format */
  timestamp: string;

  /** The message attachments */
  attachments: ChatLogAttachment[];

  /** The message embeds */
  embeds: ChatLogEmbed[];
}

/**
 * Request to save a chat log
 * Maps to Mewdeko.Controllers.Common.Chat.SaveChatLogRequest
 */
export interface SaveChatLogRequest {
  /** The Discord channel ID */
  channelId: bigint;

  /** The name for the chat log */
  name: string;

  /** The user ID who created the log */
  createdBy: bigint;

  /** The messages to save in the log */
  messages: ChatLogMessage[];
}

/**
 * Request to update chat log name
 */
export interface UpdateChatLogNameRequest {
  /** The new name for the chat log */
  name: string;
}

/**
 * Chat log summary
 */
export interface ChatLogSummary {
  /** Log ID */
  id: string;

  /** Channel ID */
  channelId: string;

  /** Channel name */
  channelName: string;

  /** Log name */
  name: string;

  /** User who created the log */
  createdBy: string;

  /** When the log was created */
  timestamp: string;

  /** Number of messages in the log */
  messageCount: number;
}

/**
 * Complete chat log with messages
 */
export interface ChatLog extends ChatLogSummary {
  /** Guild ID */
  guildId: string;

  /** The messages in the log */
  messages: ChatLogMessage[];
}
