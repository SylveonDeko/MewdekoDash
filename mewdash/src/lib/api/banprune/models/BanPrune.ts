// lib/api/banprune/models/BanPrune.ts

/**
 * Which part of a guild a ban purge setting applies to.
 */
export enum BanPruneScope {
  /** The guild-wide default, used when no override matches */
  Guild = 0,

  /** An override covering every channel inside one category */
  Category = 1,

  /** An override covering a single channel */
  Channel = 2,
}

/**
 * A moderation action that bans, and therefore has a message purge attached to it.
 */
export interface BanPruneActionInfo {
  /** Stable identifier stored with the setting */
  key: string;

  /** Name shown in the UI */
  displayName: string;

  /** Purge used when nothing is configured */
  defaultDays: number;
}

/**
 * One stored purge setting.
 */
export interface BanPruneSetting {
  /** Setting ID */
  id: number;

  /** Which part of the guild the setting applies to */
  scopeType: BanPruneScope;

  /** The category or channel ID, or "0" for the guild default */
  scopeId: string;

  /** The action key, or an empty string for every action in the scope */
  actionKey: string;

  /** The purge in days, 0 through 7 */
  pruneDays: number;
}

/**
 * Body for creating or updating a purge setting.
 */
export interface BanPruneSettingRequest {
  /** Which part of the guild the setting applies to */
  scopeType: BanPruneScope;

  /** The category or channel ID, ignored for the guild default */
  scopeId: bigint;

  /** The action key, or null to cover every action in the scope */
  actionKey: string | null;

  /** The purge in days, 0 through 7 */
  pruneDays: number;
}

/**
 * The purge a ban would use right now.
 */
export interface BanPruneEffective {
  /** The action that was resolved */
  actionKey: string;

  /** The resolved purge in days */
  pruneDays: number;
}
