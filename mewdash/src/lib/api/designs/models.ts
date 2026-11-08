import type { CardTemplate } from "../cards/models";

/**
 * Which card a design is for
 * Maps to Mewdeko.Modules.CardDesigns.Common.CardDesignTarget
 */
export enum DesignTarget {
  Rank = 0,
  Achievement = 1,
}

/**
 * How members get a design
 * Maps to Mewdeko.Modules.CardDesigns.Common.CardDesignAvailability
 */
export enum DesignAvailability {
  Free = 0,
  Shop = 1,
  Unlock = 2,
}

/**
 * What unlocks an unlock design
 * Maps to Mewdeko.Modules.CardDesigns.Common.CardDesignUnlockType
 */
export enum DesignUnlockType {
  Level = 0,
  Achievement = 1,
  Role = 2,
}

/** The data of a rank design. */
export interface RankDesignData {
  /** preset:id, upload:id, an https URL, or empty */
  background?: string | null;
}

/**
 * A design as the admin pages see it
 * Maps to Mewdeko.Controllers.Common.Designs.DesignResponse
 */
export interface Design {
  id: number;
  name: string;
  target: DesignTarget;
  availability: DesignAvailability;
  unlockType: DesignUnlockType | null;
  unlockLevel: number | null;
  unlockAchievementKey: string | null;
  unlockAchievementName: string | null;
  unlockRoleId: bigint | null;
  unlockRoleName: string | null;
  isDefault: boolean;
  /** A background reference for rank designs, a card template for achievement designs */
  data: RankDesignData | CardTemplate;
  backgroundRef: string | null;
  backgroundUrl: string | null;
  ownedCount: number;
  shopItemId: number | null;
  shopItemName: string | null;
  dateAdded: string;
  dateUpdated: string;
}

/**
 * Creates or changes a design
 * Maps to Mewdeko.Controllers.Common.Designs.DesignRequest
 */
export interface DesignRequest {
  name: string;
  target: DesignTarget;
  data?: RankDesignData | CardTemplate | null;
  availability: DesignAvailability;
  unlockType?: DesignUnlockType | null;
  unlockLevel?: number | null;
  unlockAchievementKey?: string | null;
  unlockRoleId?: bigint | null;
}

/**
 * A design a member can use
 * Maps to Mewdeko.Controllers.Common.Designs.MemberDesignResponse
 */
export interface MemberDesign {
  id: number;
  name: string;
  target: DesignTarget;
  availability: DesignAvailability;
  /** free, purchase, level, achievement or role */
  source: string;
  equipped: boolean;
  isDefault: boolean;
  data: RankDesignData | CardTemplate;
  backgroundUrl: string | null;
}

/** The designs a member can use for one card. */
export interface MemberDesignSection {
  equippedId: number | null;
  defaultId: number | null;
  designs: MemberDesign[];
}

/**
 * Everything a member can use in one community
 * Maps to Mewdeko.Controllers.Common.Designs.MemberDesignsResponse
 */
export interface MemberDesigns {
  guildId: bigint;
  userId: bigint;
  rank: MemberDesignSection;
  achievement: MemberDesignSection;
}

/** Who may make their own design: everyone, members with a chosen role, or members at or above a level. */
export enum MemberDesignWho {
  Everyone = 0,
  Roles = 1,
  Level = 2,
}

/** approved, pending or rejected */
export type MemberDesignStatus = "approved" | "pending" | "rejected";

/**
 * A community's rules for designs its members make
 * Maps to Mewdeko.Controllers.Common.Designs.MemberDesignSettingsResponse
 */
export interface MemberDesignSettings {
  enabled: boolean;
  who: MemberDesignWho;
  roleIds: bigint[];
  minLevel: number;
  uploads: boolean;
  review: boolean;
  cost: number;
  uploadsUsed: number;
  uploadsMax: number;
  pending: number;
}

/**
 * Changes the member design rules; fields left out keep their value
 * Maps to Mewdeko.Controllers.Common.Designs.MemberDesignSettingsRequest
 */
export interface MemberDesignSettingsRequest {
  enabled?: boolean;
  who?: MemberDesignWho;
  roleIds?: bigint[];
  minLevel?: number;
  uploads?: boolean;
  review?: boolean;
  cost?: number;
}

/**
 * A member's design as the moderation list shows it
 * Maps to Mewdeko.Controllers.Common.Designs.MemberDesignAdminResponse
 */
export interface MemberDesignAdmin {
  id: number;
  userId: bigint;
  userName: string | null;
  avatarUrl: string | null;
  target: DesignTarget;
  status: MemberDesignStatus;
  reviewNote: string | null;
  hasUpload: boolean;
  active: boolean;
  data: RankDesignData | CardTemplate;
  backgroundUrl: string | null;
  dateAdded: string;
  dateUpdated: string;
}

/**
 * The member designs of a community with the upload pool figures
 * Maps to Mewdeko.Controllers.Common.Designs.MemberDesignListResponse
 */
export interface MemberDesignList {
  items: MemberDesignAdmin[];
  uploadsUsed: number;
  uploadsMax: number;
  pending: number;
}

/**
 * Maps to Mewdeko.Controllers.Common.Designs.MemberDesignModerationResponse
 */
export interface MemberDesignModeration {
  /** False when the member's DMs are closed */
  notified: boolean;
}

/**
 * A member's own design for one card
 * Maps to Mewdeko.Controllers.Common.Designs.OwnDesignResponse
 */
export interface OwnDesign {
  id: number;
  target: DesignTarget;
  status: MemberDesignStatus;
  reviewNote: string | null;
  equipped: boolean;
  active: boolean;
  data: RankDesignData | CardTemplate;
  backgroundUrl: string | null;
  hasUpload: boolean;
  uploadUrl: string | null;
  dateUpdated: string;
}

/**
 * What a member can do about making their own designs in one community
 * Maps to Mewdeko.Controllers.Common.Designs.OwnDesignsResponse
 */
export interface OwnDesigns {
  enabled: boolean;
  eligible: boolean;
  /** disabled, role or level */
  reason: "disabled" | "role" | "level" | null;
  who: MemberDesignWho;
  roleNames: string[];
  minLevel: number;
  uploads: boolean;
  review: boolean;
  cost: number;
  currencyEmote: string | null;
  rank: OwnDesign | null;
  achievement: OwnDesign | null;
}

/**
 * Saves a member's own design for one card
 * Maps to Mewdeko.Controllers.Common.Designs.SaveOwnDesignRequest
 */
export interface SaveOwnDesignRequest {
  data?: RankDesignData | CardTemplate | null;
  /** A new background as a data URI */
  upload?: string | null;
  removeUpload?: boolean;
}

/**
 * Maps to Mewdeko.Controllers.Common.Designs.DesignImageResponse
 */
export interface DesignImage {
  dataUrl: string | null;
}

/**
 * A community where the member can use designs
 * Maps to Mewdeko.Controllers.Common.Designs.DesignGuildResponse
 */
export interface DesignGuild {
  guildId: bigint;
  name: string;
  iconUrl: string | null;
  available: number;
}
