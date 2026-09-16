// lib/api/serverstats/serverstats.ts
import { apiDownload, apiRequest } from "../core";
import type {
  ActivityDetail,
  ActivityFilters,
  ActivityRow,
  ChannelActivity,
  GuildSnapshot,
  JoinLeaveSeries,
  RankedEntry,
  StatSeriesPoint,
  ServerOverview,
  ServerStatsSettings,
  ServerStatsSettingsRequest,
  StatChartKindValue,
  StatKindValue,
  StatsExclusions,
  StatsExclusionKindValue,
  UserActivity,
} from "./models";

function days(value?: number): string {
  return value === undefined ? "" : `days=${value}`;
}

/**
 * Activity statistics API
 * Maps to Mewdeko.Controllers.ServerStatsController
 */
export const serverStatsApi = {
  /** Gets the guild wide overview; days 0 means all time, omitted means the guild default */
  getOverview: (guildId: bigint, lookbackDays?: number) =>
    apiRequest<ServerOverview>(`ServerStats/${guildId}/overview?${days(lookbackDays)}`),

  /** Gets one member's activity */
  getUser: (guildId: bigint, userId: bigint, lookbackDays?: number) =>
    apiRequest<UserActivity>(`ServerStats/${guildId}/user/${userId}?${days(lookbackDays)}`),

  /** Gets one channel's activity */
  getChannel: (guildId: bigint, channelId: bigint, lookbackDays?: number) =>
    apiRequest<ChannelActivity>(`ServerStats/${guildId}/channel/${channelId}?${days(lookbackDays)}`),

  /** Ranks members by messages, voice or game time */
  getTopUsers: (guildId: bigint, kind: StatKindValue, lookbackDays?: number, limit = 50, channelId?: bigint) => {
    const params = new URLSearchParams({ kind: String(kind), limit: String(limit) });
    if (lookbackDays !== undefined) params.set("days", String(lookbackDays));
    if (channelId) params.set("channelId", channelId.toString());
    return apiRequest<RankedEntry[]>(`ServerStats/${guildId}/top/users?${params}`);
  },

  /** Ranks channels by messages or voice */
  getTopChannels: (guildId: bigint, kind: StatKindValue, lookbackDays?: number, limit = 50) => {
    const params = new URLSearchParams({ kind: String(kind), limit: String(limit) });
    if (lookbackDays !== undefined) params.set("days", String(lookbackDays));
    return apiRequest<RankedEntry[]>(`ServerStats/${guildId}/top/channels?${params}`);
  },

  /** Ranks games and apps by time spent, guild wide or for one member */
  getTopActivities: (guildId: bigint, lookbackDays?: number, limit = 25, userId?: bigint) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (lookbackDays !== undefined) params.set("days", String(lookbackDays));
    if (userId) params.set("userId", userId.toString());
    return apiRequest<ActivityRow[]>(`ServerStats/${guildId}/top/activities?${params}`);
  },

  /** Gets who plays one game or app */
  getActivity: (guildId: bigint, name: string, lookbackDays?: number, limit = 25) => {
    const params = new URLSearchParams({ name, limit: String(limit) });
    if (lookbackDays !== undefined) params.set("days", String(lookbackDays));
    return apiRequest<ActivityDetail>(`ServerStats/${guildId}/activity?${params}`);
  },

  /** Gets a message or voice series */
  getSeries: (guildId: bigint, kind: StatChartKindValue, lookbackDays?: number, userId?: bigint, channelId?: bigint) => {
    const params = new URLSearchParams();
    if (lookbackDays !== undefined) params.set("days", String(lookbackDays));
    if (userId) params.set("userId", userId.toString());
    if (channelId) params.set("channelId", channelId.toString());
    return apiRequest<StatSeriesPoint[]>(`ServerStats/${guildId}/series/${kind}?${params}`);
  },

  /** Gets guild snapshots for member and status charts */
  getSnapshots: (guildId: bigint, lookbackDays?: number) =>
    apiRequest<GuildSnapshot[]>(`ServerStats/${guildId}/series/2?${days(lookbackDays)}`),

  /** Gets joins and leaves series */
  getJoinLeaveSeries: (guildId: bigint, lookbackDays?: number) =>
    apiRequest<JoinLeaveSeries>(`ServerStats/${guildId}/series/6?${days(lookbackDays)}`),

  /** Gets tracking settings */
  getSettings: (guildId: bigint) => apiRequest<ServerStatsSettings>(`ServerStats/${guildId}/settings`),

  /** Updates tracking settings */
  updateSettings: (guildId: bigint, request: ServerStatsSettingsRequest) =>
    apiRequest<ServerStatsSettings>(`ServerStats/${guildId}/settings`, "PUT", request),

  /** Gets exclusions of every kind */
  getExclusions: (guildId: bigint) => apiRequest<StatsExclusions>(`ServerStats/${guildId}/exclusions`),

  /** Adds an exclusion */
  addExclusion: (guildId: bigint, kind: StatsExclusionKindValue, targetId: bigint) =>
    apiRequest<boolean>(`ServerStats/${guildId}/exclusions/${kind}/${targetId}`, "POST"),

  /** Removes an exclusion */
  removeExclusion: (guildId: bigint, kind: StatsExclusionKindValue, targetId: bigint) =>
    apiRequest<boolean>(`ServerStats/${guildId}/exclusions/${kind}/${targetId}`, "DELETE"),

  /** Gets the activity filter */
  getActivityFilters: (guildId: bigint) => apiRequest<ActivityFilters>(`ServerStats/${guildId}/activity-filters`),

  /** Toggles a name on the activity filter; true when added */
  toggleActivityFilter: (guildId: bigint, name: string) =>
    apiRequest<boolean>(`ServerStats/${guildId}/activity-filters`, "POST", name),

  /** Downloads a ranking as CSV */
  exportCsv: (guildId: bigint, kind: StatKindValue, lookbackDays?: number) =>
    apiDownload(`ServerStats/${guildId}/export?kind=${kind}&${days(lookbackDays)}`),
};
