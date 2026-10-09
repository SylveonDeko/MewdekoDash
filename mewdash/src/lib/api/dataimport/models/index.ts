/** The bots and file formats data can be imported from. Values match ImportSource on the bot. */
export enum ImportSource {
  Mee6 = 0,
  Lurkr = 1,
  Polaris = 2,
  Arcane = 3,
  Amari = 4,
  Tatsu = 5,
  File = 6,
  UnbelievaBoat = 7,
  Mee6Settings = 8,
}

/** What an import writes to. */
export enum ImportKind {
  Xp = 0,
  Currency = 1,
  Settings = 2,
}

/** One section of a settings import, as shown before confirming. */
export interface ImportSettingsSection {
  key: string;
  count: number;
  details: string[];
}

/** What one settings section wrote. */
export interface ImportSettingsSectionResult {
  section: string;
  written: number;
  skipped: number;
  failed: boolean;
}

/** The outcome of a settings import. */
export interface ImportSettingsResult {
  importId: number;
  sections: ImportSettingsSectionResult[];
}

/** How imported values combine with what members already have. */
export enum ImportMergeMode {
  Replace = 0,
  KeepHigher = 1,
  Add = 2,
}

/** Where an import job is up to. */
export enum ImportJobStatus {
  Fetching = 0,
  Ready = 1,
  Failed = 2,
  Applying = 3,
  Applied = 4,
}

export interface ImportPreviewMember {
  userId: string;
  name?: string;
  avatarUrl?: string;
  xp?: number;
  level?: number;
  cash?: number;
  bank?: number;
}

export interface ImportPreviewReward {
  level: number;
  roleId: string;
  roleName?: string;
  exists: boolean;
}

/** A job's progress, and what it would write once the data is read. */
export interface ImportPreview {
  jobId: string;
  status: ImportJobStatus;
  progress: number;
  error?: string;
  source: ImportSource;
  kind: ImportKind;
  memberCount: number;
  existingCount: number;
  top: ImportPreviewMember[];
  roleRewards: ImportPreviewReward[];
  nativeCurve?: number;
  currentCurve: number;
  importId?: number;
  sections?: ImportSettingsSection[];
}

export interface ImportStartRequest {
  source: ImportSource;
  apiKey?: string;
  fileGzip?: string;
}

export interface XpImportRequest {
  mergeMode: ImportMergeMode;
  minimumLevel: number;
  useSourceCurve: boolean;
  importRoleRewards: boolean;
  syncRoles: boolean;
}

export interface ImportResult {
  importId: number;
  members: number;
  skipped: number;
  roleRewards: number;
  curveChanged?: number;
}

export interface ImportHistoryEntry {
  id: number;
  source: ImportSource;
  kind: ImportKind;
  memberCount: number;
  roleRewardCount: number;
  userId: string;
  dateAdded: string;
  undoneAt?: string;
  canUndo: boolean;
}
