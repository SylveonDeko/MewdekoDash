/** Whether a menu shows a dropdown or a row of buttons. */
export enum RoleMenuStyle {
  Dropdown = 0,
  Buttons = 1,
}

/** Whether members can hold any number of the menu's roles or only one at a time. */
export enum RoleMenuMode {
  PickAny = 0,
  PickOne = 1,
}

/** Whether members get a private note listing what changed after they pick. */
export enum RoleMenuReplyMode {
  Private = 0,
  Silent = 1,
}

/** Color of an option's button when the menu uses buttons. */
export enum RoleMenuButtonColor {
  Blurple = 1,
  Grey = 2,
  Green = 3,
  Red = 4,
}

/** Posting state of a menu, as reported by the bot. */
export type RoleMenuStatus = "live" | "paused" | "not_posted" | "channel_missing";

/**
 * One option on a role menu
 * Maps to Mewdeko.Controllers.Common.RoleMenus.RoleMenuOptionResponse
 */
export interface RoleMenuOption {
  /** Option ID */
  id: number;

  /** The role the option gives and takes */
  roleId: bigint;

  /** Role name, missing when the role is gone */
  roleName?: string | null;

  /** Role color as a 24 bit RGB value, 0 when none */
  roleColor: number;

  /** Text on the option */
  label: string;

  /** Unicode emoji or custom emoji text such as <:name:id> */
  emoji?: string | null;

  /** Short description */
  description?: string | null;

  /** Button color, see {@link RoleMenuButtonColor} */
  buttonStyle: number;

  /** 0-based position */
  position: number;

  /** Why the bot can't give out this role, missing when it can */
  problem?: string | null;
}

/**
 * A role menu with its options and posting state
 * Maps to Mewdeko.Controllers.Common.RoleMenus.RoleMenuResponse
 */
export interface RoleMenu {
  /** Menu ID */
  id: number;

  /** Internal name, also the default message title */
  name: string;

  /** Channel the message lives in */
  channelId: bigint;

  /** Channel name, missing when the channel is gone */
  channelName?: string | null;

  /** Posted message ID, missing when not posted */
  messageId?: bigint | null;

  /** Link to the posted message, missing when not posted */
  jumpUrl?: string | null;

  /** Raw stored message source: plain text or embed builder JSON. Missing means the default message. */
  message?: string | null;

  /** See {@link RoleMenuStyle} */
  style: number;

  /** Dropdown hint text, missing for the default */
  placeholder?: string | null;

  /** See {@link RoleMenuMode} */
  mode: number;

  /** Fewest roles a member must keep once they pick */
  minRoles: number;

  /** Most roles a member can hold, 0 for no limit */
  maxRoles: number;

  /** Role needed to use the menu, missing for anyone */
  requiredRoleId?: bigint | null;

  /** See {@link RoleMenuReplyMode} */
  replyMode: number;

  /** False when paused */
  enabled: boolean;

  /** Posting state */
  status: RoleMenuStatus;

  /** Discord user ID of the creator, 0 when unknown */
  createdBy: bigint;

  /** When the menu was created, UTC without a zone */
  dateAdded: string;

  /** When the menu last changed, UTC without a zone */
  dateModified: string;

  /** Options sorted by position */
  options: RoleMenuOption[];
}

/**
 * One option on a create or replace request
 * Maps to Mewdeko.Controllers.Common.RoleMenus.RoleMenuOptionRequest
 */
export interface RoleMenuOptionRequest {
  /** An existing option ID to keep, or null or 0 for a new option */
  id?: number | null;

  /** The role the option gives and takes */
  roleId: bigint;

  /** Text on the option. Blank means the role name. */
  label?: string | null;

  /** Unicode emoji or custom emoji text such as <:name:id> */
  emoji?: string | null;

  /** Short text under the dropdown option and in the default message */
  description?: string | null;

  /** Button color, see {@link RoleMenuButtonColor}. Defaults to grey. */
  buttonStyle: number;
}

/**
 * The full desired state of a menu, used to create one or replace one
 * Maps to Mewdeko.Controllers.Common.RoleMenus.RoleMenuRequest
 */
export interface RoleMenuRequest {
  /** Internal name. Blank means the default name. */
  name?: string | null;

  /** Channel the message lives in */
  channelId: bigint;

  /** Plain text or embed builder JSON. Empty or null means the default message. */
  message?: string | null;

  /** See {@link RoleMenuStyle} */
  style: number;

  /** Dropdown hint text. Null means the default for the mode. */
  placeholder?: string | null;

  /** See {@link RoleMenuMode} */
  mode: number;

  /** Fewest roles a member must keep once they pick */
  minRoles: number;

  /** Most roles a member can hold, 0 for no limit */
  maxRoles: number;

  /** Role needed to use the menu. Null or 0 means anyone. */
  requiredRoleId?: bigint | null;

  /** See {@link RoleMenuReplyMode} */
  replyMode: number;

  /** False to save the menu paused */
  enabled: boolean;

  /** Options in display order */
  options: RoleMenuOptionRequest[];
}

/**
 * A channel the editor can offer
 * Maps to Mewdeko.Controllers.Common.RoleMenus.RoleMenuChannelLookup
 */
export interface RoleMenuLookupChannel {
  /** Channel ID */
  id: bigint;

  /** Channel name */
  name: string;

  /** Category name, missing when uncategorized */
  categoryName?: string | null;

  /** Channel position */
  position: number;

  /** Whether the bot can post a menu here */
  canPost: boolean;

  /** Why the bot can't post here, missing when it can */
  problem?: string | null;
}

/**
 * A role the editor can offer
 * Maps to Mewdeko.Controllers.Common.RoleMenus.RoleMenuRoleLookup
 */
export interface RoleMenuLookupRole {
  /** Role ID */
  id: bigint;

  /** Role name */
  name: string;

  /** Role color as a 24 bit RGB value, 0 when none */
  color: number;

  /** Role position */
  position: number;

  /** Whether the editing member can put this role on a menu */
  assignable: boolean;

  /** Why the role can't be offered, missing when it can */
  problem?: string | null;
}

/**
 * A custom emoji from this server
 * Maps to Mewdeko.Controllers.Common.RoleMenus.RoleMenuEmojiLookup
 */
export interface RoleMenuLookupEmoji {
  /** Emoji ID */
  id: bigint;

  /** Emoji name */
  name: string;

  /** Whether the emoji is animated */
  animated: boolean;

  /** Emoji text to store on an option, such as <:name:id> or <a:name:id> */
  formatted: string;

  /** Image URL */
  url: string;
}

/**
 * Size limits enforced by the bot
 * Maps to Mewdeko.Controllers.Common.RoleMenus.RoleMenuLimitsLookup
 */
export interface RoleMenuLimits {
  /** Most menus per server */
  maxMenus: number;

  /** Most options per menu */
  maxOptions: number;

  /** Buttons per row */
  buttonsPerRow: number;

  /** Longest menu name */
  nameLength: number;

  /** Longest option label */
  labelLength: number;

  /** Longest option description */
  descriptionLength: number;

  /** Longest dropdown hint text */
  placeholderLength: number;
}

/**
 * Everything the editor needs to offer channels, roles, and emojis
 * Maps to Mewdeko.Controllers.Common.RoleMenus.RoleMenuLookupsResponse
 */
export interface RoleMenuLookups {
  /** Text and announcement channels, in Discord order */
  channels: RoleMenuLookupChannel[];

  /** Every role except the everyone role, highest first */
  roles: RoleMenuLookupRole[];

  /** This server's available custom emojis */
  emojis: RoleMenuLookupEmoji[];

  /** Whether the bot has Manage Roles */
  botCanManageRoles: boolean;

  /** How many menus the server has */
  menuCount: number;

  /** Size limits enforced by the bot */
  limits: RoleMenuLimits;
}

/**
 * One emoji and role pair in an older setup
 * Maps to Mewdeko.Controllers.Common.RoleMenus.RoleMenuImportPair
 */
export interface RoleMenuImportPair {
  /** The emoji text as stored */
  emoji: string;

  /** The role ID */
  roleId: bigint;

  /** Role name, missing when the role is gone */
  roleName?: string | null;

  /** Whether the role still exists */
  roleExists: boolean;
}

/**
 * An older emoji role setup that can be moved into a role menu
 * Maps to Mewdeko.Controllers.Common.RoleMenus.RoleMenuImportSourceResponse
 */
export interface RoleMenuImportSource {
  /** ID of the older setup */
  id: number;

  /** Channel of the older message */
  channelId: bigint;

  /** Channel name, missing when the channel is gone */
  channelName?: string | null;

  /** ID of the older message */
  messageId: bigint;

  /** Link to the older message */
  jumpUrl: string;

  /** Whether members could hold only one role from the setup */
  exclusive: boolean;

  /** Emoji and role pairs in the setup */
  pairs: RoleMenuImportPair[];
}

/**
 * Moves an older setup into a new role menu
 * Maps to Mewdeko.Controllers.Common.RoleMenus.RoleMenuImportRequest
 */
export interface RoleMenuImportRequest {
  /** ID of the older setup */
  sourceId: number;

  /** See {@link RoleMenuStyle} */
  style: number;

  /** Channel for the new menu. Null or 0 means the older setup's channel. */
  channelId?: bigint | null;

  /** Name for the new menu. Blank means the default name. */
  name?: string | null;

  /** Whether to copy the older message's text and embeds */
  copyMessage: boolean;

  /** Whether to remove the older setup once the new menu is posted */
  retireOriginal: boolean;
}
