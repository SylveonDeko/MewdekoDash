/** What unlocks an achievement. */
export enum AchievementTrigger {
  Metric = 0,
  Keyword = 1,
  Reaction = 2,
  Manual = 3,
  Feat = 4,
  Completion = 5,
}

/** Where unlock announcements go. */
export enum AchievementAnnounceMode {
  Auto = 0,
  Here = 1,
  LogChannel = 2,
  DmOnly = 3,
  Silent = 4,
}

/** Leaderboard ordering. */
export enum AchievementSort {
  Points = 0,
  Unlocked = 1,
  Recent = 2,
}

/**
 * One achievement as a server sees it
 * Maps to Mewdeko.Controllers.Common.Achievements.AchievementResponse
 */
export interface Achievement {
  /** Stable key: snake case words for built in ones, custom:{id} for server made ones */
  key: string;
  /** Category key */
  categoryKey: string;
  /** Display name */
  name: string;
  /** What it takes */
  description: string;
  /** Icon it shows, its own or its category's: fa:name, a custom emoji, an https URL, or upload:id */
  icon: string;
  /** The icon's image, null for glyph icons; uploads without a CDN give an API path */
  iconUrl?: string | null;
  /** 0 Bronze to 5 Champion */
  grade: number;
  /** Points it gives */
  points: number;
  /** Hidden until unlocked */
  hidden: boolean;
  /** Earnable right now, including its category being on */
  enabled: boolean;
  /** On by itself, ignoring its category */
  selfEnabled: boolean;
  /** See {@link AchievementTrigger} */
  trigger: number;
  /** Metric value for metric achievements */
  metric: number;
  /** Goal for metric achievements */
  threshold: number;
  /** Phrase or emoji for phrase and reaction achievements */
  keyword?: string | null;
  /** Channel a phrase or reaction achievement is limited to */
  channelId?: bigint | null;
  /** Reward role */
  roleRewardId?: bigint | null;
  /** Reward role name, missing when the role is gone */
  roleRewardName?: string | null;
  /** Reward currency */
  currencyReward: number;
  /** Reward XP */
  xpReward: number;
  /** Made by the server */
  isCustom: boolean;
  /** Database ID for server made achievements */
  customId?: number | null;
  /** Earned across every server */
  isGlobal: boolean;
  /** A built in achievement the server changed */
  isOverridden: boolean;
  /** Members who unlocked it */
  unlockCount: number;
  /** Built in name */
  defaultName?: string | null;
  /** Built in description */
  defaultDescription?: string | null;
  /** Built in points */
  defaultPoints?: number | null;
  /** Built in hidden flag */
  defaultHidden?: boolean | null;
  /** Stored name override */
  rawName?: string | null;
  /** Stored description, null when automatic or default */
  rawDescription?: string | null;
  /** Stored icon, null when it uses its category's */
  rawIcon?: string | null;
  /** Stored points, null when default */
  rawPoints?: number | null;
}

/**
 * A category with counts
 * Maps to Mewdeko.Controllers.Common.Achievements.AchievementCategoryResponse
 */
export interface AchievementCategory {
  /** Key: a built in key or cat:{id} */
  key: string;
  /** Name */
  name: string;
  /** Icon, in the same forms as an achievement's */
  icon: string;
  /** The icon's image, null for glyph icons */
  iconUrl?: string | null;
  /** Description */
  description: string;
  /** Ships with the bot */
  isBuiltIn: boolean;
  /** Gives out badges */
  hasBadges: boolean;
  /** Turned on */
  enabled: boolean;
  /** Database ID for server made categories */
  id?: number | null;
  /** Achievements in it */
  achievementCount: number;
  /** Achievements in it that are on */
  enabledCount: number;
}

/** A grade. */
export interface AchievementGrade {
  /** 0 to 5 */
  value: number;
  /** Name */
  name: string;
  /** Default points */
  points: number;
  /** "#RRGGBB" */
  color: string;
}

/** A metric achievements can count. */
export interface AchievementMetric {
  /** Numeric value */
  value: number;
  /** Enum name */
  key: string;
  /** Label */
  label: string;
  /** Unit for one */
  unit: string;
  /** Unit for several */
  unitPlural: string;
  /** What it counts */
  description: string;
  /** Data source key */
  source: string;
  /** Servers can build achievements on it */
  allowCustom: boolean;
}

/** A rank. */
export interface AchievementTier {
  /** Name */
  name: string;
  /** Points needed */
  minPoints: number;
  /** Grade it shares a color with */
  grade?: number | null;
}

/** An unlock message placeholder. */
export interface AchievementPlaceholder {
  /** The placeholder */
  name: string;
  /** What it becomes */
  description: string;
}

/** Size limits. */
export interface AchievementLimits {
  maxCustomAchievements: number;
  maxCustomCategories: number;
  nameLength: number;
  descriptionLength: number;
  keywordLength: number;
  messageLength: number;
  maxPoints: number;
  maxReward: number;
  badgeSlots: number;
}

/**
 * Everything a server can earn, plus reference data
 * Maps to Mewdeko.Controllers.Common.Achievements.AchievementCatalogResponse
 */
export interface AchievementCatalog {
  categories: AchievementCategory[];
  achievements: Achievement[];
  grades: AchievementGrade[];
  metrics: AchievementMetric[];
  tiers: AchievementTier[];
  placeholders: AchievementPlaceholder[];
  limits: AchievementLimits;
  /** Images the server uploaded for icons */
  uploads: AchievementIconUpload[];
}

/** An image a server uploaded for icons. */
export interface AchievementIconUpload {
  id: number;
  /** The icon value that uses it: upload:id */
  icon: string;
  /** A public URL, or an API path on instances with neither a CDN nor a dashboard URL */
  url: string;
}

/** One Font Awesome glyph the icon picker offers. */
export interface AchievementGlyph {
  /** Used as fa:name */
  name: string;
  /** Primary layer code point */
  codepoint: number;
  /** Other names to search by */
  aliases: string[];
}

/** An achievement as the editor has it, drawn before saving. */
export interface AchievementImagePreviewRequest {
  key?: string | null;
  categoryKey?: string | null;
  name: string;
  description?: string | null;
  icon?: string | null;
  grade: number;
  points?: number | null;
}

/**
 * A server's achievement settings
 * Maps to Mewdeko.Controllers.Common.Achievements.AchievementSettingsResponse
 */
export interface AchievementSettings {
  enabled: boolean;
  /** See {@link AchievementAnnounceMode} */
  announceMode: number;
  logChannelId?: bigint | null;
  dmByDefault: boolean;
  mentionUsers: boolean;
  unlockMessage?: string | null;
  xpPerPoint: number;
  revealHidden: boolean;
  /** Unlock messages carry a generated image */
  unlockImage: boolean;
  /** Seconds after which unlock messages in channels are deleted; 0 keeps them */
  deleteAfter: number;
  disabledCategories: string[];
  categoryOrder: string[];
  excludedRoleIds: bigint[];
  excludedChannelIds: bigint[];
  /** Channels where achievements are earned but unlocks are never announced */
  quietChannelIds: bigint[];
  /** Unlocks stay out of channels the member can't send messages in */
  requireSendPermission: boolean;
  backfilledAt?: string | null;
}

/** Changes to settings. Missing fields stay as they are. */
export interface AchievementSettingsRequest {
  enabled?: boolean;
  announceMode?: number;
  /** 0 clears the log channel */
  logChannelId?: string | bigint;
  dmByDefault?: boolean;
  mentionUsers?: boolean;
  /** "" clears the message */
  unlockMessage?: string;
  xpPerPoint?: number;
  revealHidden?: boolean;
  unlockImage?: boolean;
  deleteAfter?: number;
  excludedRoleIds?: string[];
  excludedChannelIds?: string[];
  quietChannelIds?: string[];
  requireSendPermission?: boolean;
}

/** A recent unlock. */
export interface AchievementRecentUnlock {
  userId: bigint;
  username: string;
  avatarUrl?: string | null;
  key: string;
  name: string;
  icon: string;
  iconUrl?: string | null;
  grade: number;
  unlockedAt: string;
}

/** An achievement and how many unlocked it. */
export interface AchievementRarity {
  key: string;
  name: string;
  icon: string;
  iconUrl?: string | null;
  grade: number;
  count: number;
}

/**
 * The dashboard overview
 * Maps to Mewdeko.Controllers.Common.Achievements.AchievementOverviewResponse
 */
export interface AchievementOverview {
  settings: AchievementSettings;
  /** Data source key to whether it is on */
  dataSources: Record<string, boolean>;
  members: number;
  unlocks: number;
  unlocksThisWeek: number;
  earnable: number;
  total: number;
  customCount: number;
  recent: AchievementRecentUnlock[];
  mostCommon: AchievementRarity[];
  rarest: AchievementRarity[];
}

/** A channel for selectors. */
export interface AchievementChannelLookup {
  id: bigint;
  name: string;
  categoryName?: string | null;
  /** 0 text, 2 voice */
  type: number;
  canSend: boolean;
}

/** A role for selectors. */
export interface AchievementRoleLookup {
  id: bigint;
  name: string;
  color: number;
  position: number;
  assignable: boolean;
}

/** A server emoji. */
export interface AchievementEmojiLookup {
  id: bigint;
  name: string;
  formatted: string;
  url: string;
}

/** Channels, roles, and emojis for editors. */
export interface AchievementLookups {
  channels: AchievementChannelLookup[];
  roles: AchievementRoleLookup[];
  emojis: AchievementEmojiLookup[];
  botCanManageRoles: boolean;
}

/** Changes to a built in achievement. Missing text fields keep the default. */
export interface AchievementOverrideRequest {
  enabled: boolean;
  name?: string | null;
  description?: string | null;
  /** Icon, or null for the category's */
  icon?: string | null;
  points?: number | null;
  hidden?: boolean | null;
  roleRewardId?: string | null;
  currencyReward: number;
  xpReward: number;
}

/** A server made achievement. */
export interface CustomAchievementRequest {
  categoryKey: string;
  name: string;
  description?: string | null;
  /** Icon, or null for the category's */
  icon?: string | null;
  grade: number;
  points?: number | null;
  hidden: boolean;
  enabled: boolean;
  /** 0 metric, 1 phrase, 2 reaction, 3 manual */
  trigger: number;
  metric: number;
  threshold: number;
  keyword?: string | null;
  channelId?: string | null;
  roleRewardId?: string | null;
  currencyReward: number;
  xpReward: number;
}

/** A member's totals. */
export interface AchievementMember {
  userId: bigint;
  username: string;
  displayName: string;
  /** Their account's display name, when they set one */
  globalName?: string | null;
  avatarUrl?: string | null;
  points: number;
  unlocked: number;
  tier: string;
  tierGrade?: number | null;
  lastUnlockAt?: string | null;
  rank: number;
  inServer: boolean;
}

/** A page of members. */
export interface AchievementMembersPage {
  total: number;
  members: AchievementMember[];
}

/** Where a member stands on one achievement. */
export interface AchievementProgress {
  key: string;
  unlockedAt?: string | null;
  current?: number | null;
}

/** A badge. */
export interface AchievementBadge {
  key: string;
  name: string;
  icon: string;
  iconUrl?: string | null;
  grade: number;
  source: string;
  short: string;
}

/** One member in detail. */
export interface AchievementMemberDetail {
  member: AchievementMember;
  total: number;
  progress: AchievementProgress[];
  badges: AchievementBadge[];
  equipped: (string | null)[];
}

/** A member's own preferences. */
export interface AchievementUserSettings {
  /** 0 everyone, 1 only me */
  profileVisibility: number;
  /** 0 everyone, 1 only me */
  achievementsVisibility: number;
  /** 0 everyone, 1 only me */
  badgesVisibility: number;
  hideFromLeaderboards: boolean;
  /** 0 server default, 1 always, 2 never */
  dmUnlocks: number;
  showInLog: boolean;
  mentionMe: boolean;
}

/** A member's own view of their achievements in a server. */
export interface AchievementMe {
  enabled: boolean;
  member: AchievementMember;
  total: number;
  tierPoints: number;
  nextTier?: string | null;
  nextTierPoints?: number | null;
  categories: AchievementCategory[];
  achievements: Achievement[];
  progress: AchievementProgress[];
  badges: AchievementBadge[];
  equipped: (string | null)[];
  settings: AchievementUserSettings;
  globalPoints: number;
  globalUnlocked: number;
  globalServers: number;
  grades: AchievementGrade[];
}

/**
 * What fills an achievement card behind its elements
 * Maps to Mewdeko.Modules.Achievements.Common.AchievementCardBackground
 */
export interface AchievementCardBackground {
  /** palette, solid, gradient, or image */
  kind: "palette" | "solid" | "gradient" | "image";
  color: string;
  color2: string;
  angle: number;
  /** An https URL or upload:id */
  url: string;
  fit: "cover" | "contain";
  /** How much the page color covers an image, 0 to 1 */
  dim: number;
  /** Whether the palette wash is laid over solid, gradient, and image backgrounds */
  wash: boolean;
}

/** Built in element kinds: shown once each, hidden rather than removed. */
export type AchievementCardBuiltInType =
  | "icon" | "grade" | "label" | "title" | "description" | "progress"
  | "avatar" | "member" | "category" | "points" | "more";

/** Element kinds a server can add any number of. */
export type AchievementCardCustomType = "rectangle" | "ellipse" | "text" | "image" | "glyph";

/**
 * One element of an achievement card. Colors are tokens: #rrggbb, #rrggbbaa, or a palette name
 * (primary, secondary, accent, text, muted, grade) with an optional hex alpha such as primary@30.
 * Maps to Mewdeko.Modules.Achievements.Common.AchievementCardElement
 */
export interface AchievementCardElement {
  id: string;
  type: AchievementCardBuiltInType | AchievementCardCustomType;
  name: string;
  visible: boolean;
  show: "always" | "unlocked" | "locked";
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  opacity: number;
  fill: string;
  fill2: string;
  fillAngle: number;
  stroke: string;
  strokeWidth: number;
  radius: number;
  shadowColor: string;
  shadowBlur: number;
  shadowX: number;
  shadowY: number;
  color: string;
  color2: string;
  color3: string;
  fontSize: number;
  bold: boolean;
  align: "left" | "center" | "right";
  uppercase: boolean;
  spacing: number;
  lineHeight: number;
  maxLines: number;
  text: string;
  glyph: string;
  url: string;
  fit: "cover" | "contain";
  autoWidth: boolean;
  followId: string;
  besideId: string;
  gap: number;
}

/**
 * A server's achievement card design
 * Maps to Mewdeko.Modules.Achievements.Common.AchievementCardTemplate
 */
export interface AchievementCardTemplate {
  width: number;
  height: number;
  radius: number;
  borderColor: string;
  borderWidth: number;
  shadow: boolean;
  background: AchievementCardBackground;
  /** Back to front */
  elements: AchievementCardElement[];
}

/**
 * A server's card design and what the designer needs
 * Maps to Mewdeko.Controllers.Common.Achievements.AchievementCardResponse
 */
export interface AchievementCard {
  /** Saved designs, oldest first */
  designs: AchievementCardDesign[];
  /** The design every achievement uses unless its category or itself picks another; null for the built in one */
  defaultId: number | null;
  /** The built in design, the starting point for new designs */
  builtIn: AchievementCardTemplate;
  /** Design IDs categories and achievements pick instead of the default, by key */
  assignments: { categories: Record<string, number>; achievements: Record<string, number> };
  images: AchievementIconUpload[];
  placeholders: string[];
  /** primary, secondary, accent, text, muted, background as hex */
  palette: Record<string, string>;
  limits: {
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
    maxElements: number;
    maxText: number;
    maxImages: number;
    maxDesigns: number;
    nameLength: number;
  };
}

/**
 * A saved card design
 * Maps to Mewdeko.Controllers.Common.Achievements.AchievementCardDesignResponse
 */
export interface AchievementCardDesign {
  id: number;
  name: string;
  template: AchievementCardTemplate;
  dateUpdated: string;
}

/** Where one element landed on a drawn card, in card pixels. */
export interface AchievementCardBox {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  drawn: boolean;
}

/**
 * A drawn card preview
 * Maps to Mewdeko.Controllers.Common.Achievements.AchievementCardPreviewResponse
 */
export interface AchievementCardPreview {
  image: string;
  width: number;
  height: number;
  /** Transparent space around the card on every side */
  margin: number;
  layout: AchievementCardBox[];
  template: AchievementCardTemplate | null;
}
