// lib/api/bothell/models/BotHell.ts

/**
 * One server as evaluated against the bot hell thresholds.
 */
export interface BotHellEntry {
  /** The server id. */
  guildId: bigint;

  /** The server name. */
  guildName: string;

  /** The server icon url, if it has one. */
  iconUrl: string | null;

  /** The server owner's id. */
  ownerId: bigint;

  /** The total member count. */
  total: number;

  /** How many cached members are humans. */
  humans: number;

  /** How many cached members are bots. */
  bots: number;

  /** The percentage of members that are bots. */
  percent: number;

  /** Whether the server met a threshold. */
  isBotHell: boolean;

  /** Whether the bot count threshold was met. */
  byCount: boolean;

  /** Whether the bot percentage threshold was met. */
  byPercent: boolean;

  /** Whether the member list was fully downloaded when counted. Partial caches undercount bots. */
  complete: boolean;

  /** When the bot joined the server, if known (UTC ISO string). */
  joinedAt: string | null;
}

/**
 * The bot wide bot hell settings, with the effective report channel resolved.
 */
export interface BotHellSettings {
  /** Servers smaller than this are never flagged. */
  minMembers: number;

  /** Bots at or above this flag the server, zero disables the check. */
  botCount: number;

  /** Bot percentage at or above this flags the server, zero disables the check. */
  botPercent: number;

  /** Whether flagged servers are left automatically on join. */
  autoLeave: boolean;

  /** The configured report channel, zero when the join/leave channel is used. */
  channelId: bigint;

  /** The channel reports actually go to after the fallback. */
  effectiveChannelId: bigint;

  /** Whether the effective channel came from the join/leave fallback. */
  usingFallback: boolean;

  /** The effective channel's name, if resolvable. */
  channelName: string | null;

  /** The guild the effective channel is in. */
  guildId: bigint;

  /** The name of the guild the effective channel is in. */
  guildName: string | null;

  /** Whether the bot can post to the effective channel. */
  reachable: boolean;
}

/**
 * The settings the dashboard sends when saving.
 */
export interface BotHellSettingsRequest {
  minMembers: number;
  botCount: number;
  botPercent: number;
  autoLeave: boolean;
  channelId: bigint;
}

/**
 * The full server listing plus the thresholds it was evaluated with.
 */
export interface BotHellList {
  /** Every server the bot is in, flagged ones first. */
  items: BotHellEntry[];

  /** How many servers are flagged. */
  flagged: number;

  /** The thresholds used for the evaluation. */
  settings: BotHellSettings;
}

/**
 * The outcome of a bulk leave.
 */
export interface BotHellLeaveResult {
  /** The servers that were left. */
  left: bigint[];

  /** The servers that could not be left, keyed by id, with the reason. */
  failed: Record<string, string>;
}
