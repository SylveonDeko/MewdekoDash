/** A guild's verification gate settings, as the bot reads and writes them */
export interface VerificationSettings {
  enabled: boolean;
  channelId: bigint | null;
  unverifiedRoleId: bigint | null;
  verifiedRoleId: bigint | null;
  maxAttempts: number;
  timeoutMinutes: number;
  kickOnFail: boolean;
  logChannelId: bigint | null;
}

/** A channel overwrite the gate would change */
export interface VerificationPermissionChange {
  channelId: bigint;
  channelName: string;
  roleId: bigint;
}

/** How many overwrites were changed and how many failed */
export interface VerificationPermissionResult {
  changed: number;
  failed: number;
}

/** How many members a bulk verification covers */
export interface VerificationBulkResponse {
  count: number;
}
