/** What happens to a member who never gets a required role */
export type JoinRoleTimeoutAction = "Kick" | "Ban" | "AddRole" | "RemoveRoles" | "Timeout";

/** A guild's join role timeout settings, as the bot reads and writes them */
export interface JoinRoleTimeoutSettings {
  enabled: boolean;
  timeoutMinutes: number;
  requiredRoleIds: bigint[];
  exemptRoleIds: bigint[];
  action: JoinRoleTimeoutAction;
  actionRoleId?: bigint;
  warnBeforeMinutes?: number;
  warnMessage?: string;
  actionMessage?: string;
  logChannelId?: bigint;
  includeExistingMembers: boolean;
}

/** A member counting down toward the timeout */
export interface JoinRoleTimeoutPendingMember {
  userId: bigint;
  joinedAt: string;
  dueAt: string;
  warnedAt?: string;
}

/** How many members are counting down, and the next few to come due */
export interface JoinRoleTimeoutPending {
  count: number;
  next: JoinRoleTimeoutPendingMember[];
}
