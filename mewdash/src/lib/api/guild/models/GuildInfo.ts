// lib/api/guild/models/GuildInfo.ts

/**
 * Essential guild information model for dashboard
 * Maps to Mewdeko.Controllers.Common.Guild.GuildInfoModel
 */
export interface GuildInfo {
  /** The guild ID */
  id: bigint;

  /** The guild name */
  name: string;

  /** The guild icon hash */
  icon: string | null;

  /** The full guild icon URL */
  iconUrl: string | null;

  /** The guild banner hash */
  banner: string | null;

  /** The full guild banner URL */
  bannerUrl: string | null;

  /** The guild description */
  description: string | null;

  /** Total member count */
  memberCount: number;

  /** Premium tier (boost level) */
  premiumTier: number;

  /** Guild owner ID */
  ownerId: bigint;

  /** When the guild was created */
  createdAt: string;
}
