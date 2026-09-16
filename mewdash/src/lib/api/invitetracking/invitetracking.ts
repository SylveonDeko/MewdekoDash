// lib/api/invitetracking/invitetracking.ts
import { apiDownload, apiRequest } from "../core";
import type {
  GuildInviteCode,
  InviteAdjustRequest,
  InviteAnalytics,
  InviteBreakdown,
  InvitedPage,
  InviteExclusionKindValue,
  InviteLabel,
  InviteLabelRequest,
  InviteLeaderboardEntry,
  InviterInfo,
  InviteTrackingSettings,
  InviteUser,
  StatsRangeValue,
} from "./models";

/**
 * Invite tracking API
 * Maps to Mewdeko.Controllers.InviteTrackingController
 */
export const inviteTrackingApi = {
  /** Gets invite tracking settings for a guild */
  getInviteSettings: (guildId: bigint) =>
    apiRequest<InviteTrackingSettings>(`InviteTracking/${guildId}/settings`),

  /** Enables or disables invite tracking */
  toggleInviteTracking: (guildId: bigint, enabled: boolean) =>
    apiRequest<boolean>(`InviteTracking/${guildId}/toggle`, "POST", enabled),

  /** Sets whether invites are removed when the invited member leaves */
  setRemoveOnLeave: (guildId: bigint, removeOnLeave: boolean) =>
    apiRequest<boolean>(`InviteTracking/${guildId}/remove-on-leave`, "POST", removeOnLeave),

  /** Sets the minimum account age as a .NET TimeSpan string such as "3.00:00:00" */
  setMinAccountAge: (guildId: bigint, minAge: string) =>
    apiRequest<string>(`InviteTracking/${guildId}/min-age`, "POST", minAge),

  /** Sets whether rejoining members earn a regular invite (false flags them as fake) */
  setCountRejoins: (guildId: bigint, countRejoins: boolean) =>
    apiRequest<boolean>(`InviteTracking/${guildId}/count-rejoins`, "POST", countRejoins),

  /** Sets whether members without an avatar are flagged as fake */
  setFakeOnNoAvatar: (guildId: bigint, enabled: boolean) =>
    apiRequest<boolean>(`InviteTracking/${guildId}/fake-no-avatar`, "POST", enabled),

  /** Sets the channel personal links point at, or null for the system channel */
  setLinkChannel: (guildId: bigint, channelId: bigint | null) =>
    apiRequest<void>(`InviteTracking/${guildId}/link-channel`, "POST", channelId),

  /** Sets the join and leave log channel, or null to disable */
  setLogChannel: (guildId: bigint, channelId: bigint | null) =>
    apiRequest<void>(`InviteTracking/${guildId}/log-channel`, "POST", channelId),

  /** Gets the net invite count for a user */
  getInviteCount: (guildId: bigint, userId: bigint) =>
    apiRequest<number>(`InviteTracking/${guildId}/count/${userId}`),

  /** Gets a user's regular, left, fake and bonus breakdown plus rank */
  getBreakdown: (guildId: bigint, userId: bigint) =>
    apiRequest<InviteBreakdown>(`InviteTracking/${guildId}/breakdown/${userId}`),

  /** Adjusts a user's tally; deltas may be negative */
  adjust: (guildId: bigint, userId: bigint, request: InviteAdjustRequest) =>
    apiRequest<InviteBreakdown>(`InviteTracking/${guildId}/adjust/${userId}`, "POST", request),

  /** Resets one user's invites */
  resetUser: (guildId: bigint, userId: bigint) =>
    apiRequest<boolean>(`InviteTracking/${guildId}/count/${userId}`, "DELETE"),

  /** Resets invites for the whole guild (0) or for inviters who left (1) */
  reset: (guildId: bigint, scope: 0 | 1) =>
    apiRequest<number>(`InviteTracking/${guildId}/reset`, "POST", scope),

  /** Imports use counts from Discord; returns how many inviters were raised */
  sync: (guildId: bigint, userId?: bigint) =>
    apiRequest<number>(`InviteTracking/${guildId}/sync${userId ? `?userId=${userId}` : ""}`, "POST"),

  /** Gets who invited a user and how they joined */
  getInviter: (guildId: bigint, userId: bigint) =>
    apiRequest<InviterInfo>(`InviteTracking/${guildId}/inviter/${userId}`),

  /** Gets witnessed joins filtered by inviter, code or label */
  getInvited: (
    guildId: bigint,
    filters: { inviterId?: bigint; code?: string; label?: string; includeLeft?: boolean },
    page: number = 1,
    pageSize: number = 50,
  ) => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (filters.inviterId) params.set("inviterId", filters.inviterId.toString());
    if (filters.code) params.set("code", filters.code);
    if (filters.label) params.set("label", filters.label);
    if (filters.includeLeft !== undefined) params.set("includeLeft", String(filters.includeLeft));
    return apiRequest<InvitedPage>(`InviteTracking/${guildId}/invited?${params}`);
  },

  /** Gets members a user invited who are still present */
  getInvitedUsers: (guildId: bigint, userId: bigint) =>
    apiRequest<InviteUser[]>(`InviteTracking/${guildId}/invited/${userId}`),

  /** Gets the leaderboard for a window, optionally only members with a role */
  getInviteLeaderboard: (
    guildId: bigint,
    range: StatsRangeValue = 0,
    page: number = 1,
    pageSize: number = 25,
    roleId?: bigint,
  ) => {
    const params = new URLSearchParams({
      range: String(range),
      page: String(page),
      pageSize: String(pageSize),
    });
    if (roleId) params.set("roleId", roleId.toString());
    return apiRequest<InviteLeaderboardEntry[]>(`InviteTracking/${guildId}/leaderboard?${params}`);
  },

  /** Gets growth analytics and a daily series for a window */
  getAnalytics: (guildId: bigint, range: StatsRangeValue = 3) =>
    apiRequest<InviteAnalytics>(`InviteTracking/${guildId}/analytics?range=${range}`),

  /** Gets the invite codes in the guild with labels and owners */
  getCodes: (guildId: bigint) => apiRequest<GuildInviteCode[]>(`InviteTracking/${guildId}/codes`),

  /** Deletes an invite code */
  deleteCode: (guildId: bigint, code: string) =>
    apiRequest<boolean>(`InviteTracking/${guildId}/codes/${encodeURIComponent(code)}`, "DELETE"),

  /** Gets labels */
  getLabels: (guildId: bigint) => apiRequest<InviteLabel[]>(`InviteTracking/${guildId}/labels`),

  /** Creates or updates a label */
  setLabel: (guildId: bigint, request: InviteLabelRequest) =>
    apiRequest<InviteLabel>(`InviteTracking/${guildId}/labels`, "PUT", request),

  /** Removes a label */
  removeLabel: (guildId: bigint, code: string) =>
    apiRequest<boolean>(`InviteTracking/${guildId}/labels/${encodeURIComponent(code)}`, "DELETE"),

  /** Gets exclusions of a kind */
  getExclusions: (guildId: bigint, kind: InviteExclusionKindValue) =>
    apiRequest<bigint[]>(`InviteTracking/${guildId}/exclusions/${kind}`),

  /** Adds an exclusion */
  addExclusion: (guildId: bigint, kind: InviteExclusionKindValue, targetId: bigint) =>
    apiRequest<boolean>(`InviteTracking/${guildId}/exclusions/${kind}/${targetId}`, "POST"),

  /** Removes an exclusion */
  removeExclusion: (guildId: bigint, kind: InviteExclusionKindValue, targetId: bigint) =>
    apiRequest<boolean>(`InviteTracking/${guildId}/exclusions/${kind}/${targetId}`, "DELETE"),

  /** Downloads the leaderboard as CSV */
  exportLeaderboard: (guildId: bigint, range: StatsRangeValue = 0) =>
    apiDownload(`InviteTracking/${guildId}/export/leaderboard?range=${range}`),

  /** Downloads witnessed joins as CSV */
  exportInvited: (guildId: bigint, filters: { inviterId?: bigint; code?: string; label?: string } = {}) => {
    const params = new URLSearchParams();
    if (filters.inviterId) params.set("inviterId", filters.inviterId.toString());
    if (filters.code) params.set("code", filters.code);
    if (filters.label) params.set("label", filters.label);
    const query = params.toString();
    return apiDownload(`InviteTracking/${guildId}/export/invited${query ? `?${query}` : ""}`);
  },
};
