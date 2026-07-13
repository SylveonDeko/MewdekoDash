// lib/api/protection/models/Protection.ts

export interface AddPatternRequest {
  pattern: string;
  name: string;
  checkUsername: boolean;
  checkDisplayName: boolean;
}

export interface UpdateAntiPatternConfigRequest {
  checkAccountAge?: boolean | null;
  maxAccountAgeMonths?: number | null;
  checkJoinTiming?: boolean | null;
  maxJoinHours?: number | null;
  checkBatchCreation?: boolean | null;
  checkOfflineStatus?: boolean | null;
  checkNewAccounts?: boolean | null;
  newAccountDays?: number | null;
  minimumScore?: number | null;
}

export interface AntiPatternPattern {
  id: number;
  name: string;
  pattern: string;
  checkUsername: boolean;
  checkDisplayName: boolean;
}

export interface AntiImageHashConfig {
  enabled: boolean;
  action: number;
  punishDuration: number;
  roleId?: bigint | null;
  /** Max hamming distance out of 256 PDQ bits. PDQ's standard "same image" threshold is 31. */
  hashThreshold: number;
  deleteMessages: boolean;
  notifyUser: boolean;
  ignoreBots: boolean;
  checkEmbeds: boolean;
  /** Strip a solid border from posted images before matching, catching bordered copies. */
  checkBorders: boolean;
  /** Also block the known scam images that ship with the bot. */
  usePresetList: boolean;
  maxImageSizeMb: number;
}

/**
 * A blocked image. `action` is null when the image uses the guild default action. `variants` holds the
 * mirrored and border-stripped hashes; it is null for entries added from a bare hash, which therefore
 * only match the exact image.
 */
export interface BannedImageHash {
  id: number;
  guildId: bigint;
  hash: string;
  variants: string | null;
  quality: number;
  name: string | null;
  sourceUrl: string | null;
  action: number | null;
  punishDuration: number | null;
  roleId: bigint | null;
  hitCount: number;
  lastTriggeredAt: string | null;
  addedBy: bigint | null;
  dateAdded: string | null;
}

export interface ImageHashPreview {
  hash: string;
  quality: number;
  reliable: boolean;
  minQuality: number;
}

/**
 * Supply exactly one source: a precomputed `hash`, an `imageUrl` the bot downloads, or the
 * base64 bytes of an uploaded image.
 */
export interface AddBannedImageHashRequest {
  hash?: string;
  imageUrl?: string;
  imageBase64?: string;
  name?: string | null;
  action?: number | null;
  punishDuration?: number | null;
  roleId?: bigint | null;
  addedBy?: bigint | null;
}
