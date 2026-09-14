// lib/api/analytics/analytics.ts
import { apiDownload, apiRequest } from "../core";
import type {
  AggregateQuery,
  AggregateResult,
  AiGuildRow,
  AiSummary,
  AlertBand,
  AlertEvent,
  AlertEventQuery,
  AlertMuteResult,
  AlertRule,
  AlertRuleInput,
  AlertSendResult,
  BouncedGuildRow,
  BreakdownQuery,
  BreakdownRow,
  ChurnSummary,
  CommandErrorSampleQuery,
  CommandErrorSampleRow,
  CommandQuery,
  DayValue,
  ErrorGroupQuery,
  ErrorGroupRow,
  ErrorOccurrenceRow,
  ErrorSampleQuery,
  EventCountRow,
  FailingCommandRow,
  FeatureAdoptionRow,
  FeatureDepth,
  FilterParams,
  FiringAlert,
  GuildAnomalyRow,
  GuildCard,
  GuildEventQuery,
  GuildEventRow,
  GuildTimeline,
  InvocationPage,
  InvocationQuery,
  MetricDescriptor,
  Page,
  PipelineHealth,
  RetentionPoint,
  RouteErrorRow,
  RouteRow,
  SeriesQuery,
  SeriesResult,
  SettingUsageRow,
  SilentGuildRow,
  SnapshotRow,
  TimeParams,
  TopCommandRow,
  TopGuildRow,
  UsageHeatmap,
  WebsiteFunnel,
} from "./models";

type QueryValue = string | number | boolean | null | undefined;

/**
 * Serialises a query object, dropping empty values and expanding `labels`
 * into `f.<label>` pairs the bot API expects.
 */
function toQuery(params: Record<string, QueryValue | Record<string, string> | undefined>): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (key === "labels" && typeof value === "object") {
      for (const [label, labelValue] of Object.entries(value)) {
        if (labelValue !== undefined && labelValue !== null && labelValue !== "") {
          q.set(`f.${label}`, labelValue);
        }
      }
      continue;
    }
    q.set(key, String(value));
  }
  const text = q.toString();
  return text ? `?${text}` : "";
}

function path(route: string, params?: Record<string, QueryValue | Record<string, string> | undefined>): string {
  return `Analytics/${route}${params ? toQuery(params) : ""}`;
}

/**
 * Analytics API (owner only).
 * Maps to Mewdeko.Controllers.AnalyticsController and AnalyticsAlertsController.
 * Every read goes through the `[...path]` proxy, which resolves the selected
 * instance and attaches the key.
 */
export const analyticsApi = {
  /** Metric registry: name, kind and the label keys with sample values. */
  metrics: () => apiRequest<MetricDescriptor[]>(path("metrics")),

  /** Time series for a metric, optionally grouped by a label and folded past `max`. */
  series: (q: SeriesQuery) =>
    apiRequest<SeriesResult>(path("series", { ...q })),

  /** One number over the range. */
  aggregate: (q: AggregateQuery) =>
    apiRequest<AggregateResult>(path("aggregate", { ...q })),

  /** Top values of one label for a metric over the range. */
  breakdown: (q: BreakdownQuery) =>
    apiRequest<BreakdownRow[]>(path("breakdown", { ...q })),

  topCommands: (q: CommandQuery) =>
    apiRequest<TopCommandRow[]>(path("commands/top", { ...q })),

  failingCommands: (q: CommandQuery) =>
    apiRequest<FailingCommandRow[]>(path("commands/failing", { ...q })),

  invocations: (q: InvocationQuery) =>
    apiRequest<InvocationPage>(path("commands/invocations", { ...q })),

  commandErrorSamples: (q: CommandErrorSampleQuery) =>
    apiRequest<CommandErrorSampleRow[]>(path("commands/error-samples", { ...q })),

  /** Hour of day x guild size bucket invocation counts. */
  commandHeatmap: (q: CommandQuery) =>
    apiRequest<UsageHeatmap>(path("commands/heatmap", { ...q })),

  eventCounts: (q: FilterParams) =>
    apiRequest<EventCountRow[]>(path("events/counts", { ...q })),

  topGuilds: (q: TimeParams & { bot?: string; eventType?: string; limit?: number }) =>
    apiRequest<TopGuildRow[]>(path("guilds/top", { ...q })),

  guildAnomalies: (q: TimeParams & { bot?: string; minCount?: number; limit?: number }) =>
    apiRequest<GuildAnomalyRow[]>(path("guilds/anomalies", { ...q })),

  guildTimeline: (guildId: string, q: TimeParams & { bot?: string }) =>
    apiRequest<GuildTimeline>(path(`guilds/${encodeURIComponent(guildId)}/timeline`, { ...q })),

  guildEvents: (guildId: string, q: GuildEventQuery) =>
    apiRequest<Page<GuildEventRow>>(path(`guilds/${encodeURIComponent(guildId)}/events`, { ...q })),

  guildCard: (guildId: string, q: TimeParams) =>
    apiRequest<GuildCard>(path(`guilds/${encodeURIComponent(guildId)}/card`, { ...q })),

  featureAdoption: (q: TimeParams & { bot?: string }) =>
    apiRequest<FeatureAdoptionRow[]>(path("features/adoption", { ...q })),

  featureDepth: (q: TimeParams & { bot?: string }) =>
    apiRequest<FeatureDepth>(path("features/depth", { ...q })),

  featureSettings: (feature?: string) =>
    apiRequest<SettingUsageRow[]>(path("features/settings", { feature })),

  featureCensus: (metric: string, days = 90) =>
    apiRequest<DayValue[]>(path("features/census", { metric, days })),

  serverSnapshots: (days = 30, bot?: string) =>
    apiRequest<SnapshotRow[]>(path("servers/snapshots", { days, bot })),

  growthChurn: (q: FilterParams) =>
    apiRequest<ChurnSummary>(path("growth/churn", { ...q })),

  growthRetention: (days = 30, q: Omit<FilterParams, keyof TimeParams> = {}) =>
    apiRequest<RetentionPoint[]>(path("growth/retention", { days, ...q })),

  growthBounced: (q: TimeParams & { bot?: string; limit?: number }) =>
    apiRequest<BouncedGuildRow[]>(path("growth/bounced", { ...q })),

  growthSilent: (q: { bot?: string; limit?: number } = {}) =>
    apiRequest<SilentGuildRow[]>(path("growth/silent", { ...q })),

  /** Exception groups folded over the range. */
  errors: (q: ErrorGroupQuery) =>
    apiRequest<ErrorGroupRow[]>(path("errors", { ...q })),

  /** Hourly occurrences behind one exception group. */
  errorSamples: (q: ErrorSampleQuery) =>
    apiRequest<ErrorOccurrenceRow[]>(path("errors/samples", { ...q })),

  aiSummary: (q: FilterParams) =>
    apiRequest<AiSummary>(path("ai/summary", { ...q })),

  aiGuilds: (q: TimeParams & { bot?: string; limit?: number }) =>
    apiRequest<AiGuildRow[]>(path("ai/guilds", { ...q })),

  websiteRoutes: (q: TimeParams & { limit?: number }) =>
    apiRequest<RouteRow[]>(path("website/routes", { ...q })),

  websiteErrors: (q: TimeParams & { limit?: number }) =>
    apiRequest<RouteErrorRow[]>(path("website/errors", { ...q })),

  websiteFunnel: (q: TimeParams) =>
    apiRequest<WebsiteFunnel>(path("website/funnel", { ...q })),

  /** Pipeline state: last flush, buffers, table sizes and the instance list. */
  health: () => apiRequest<PipelineHealth>(path("health")),

  dailyTotals: (metric: string, days = 365, bot?: string) =>
    apiRequest<DayValue[]>(path("daily-totals", { metric, days, bot })),

  /** CSV of a series query. */
  exportCsv: (q: SeriesQuery) => apiDownload(path("export", { ...q })),

  alertRules: () => apiRequest<AlertRule[]>(path("alerts/rules")),

  createAlertRule: (rule: AlertRuleInput) =>
    apiRequest<AlertRule>(path("alerts/rules"), "POST", rule),

  updateAlertRule: (id: number, rule: AlertRuleInput) =>
    apiRequest<AlertRule>(path(`alerts/rules/${id}`), "PUT", rule),

  deleteAlertRule: (id: number) =>
    apiRequest<void>(path(`alerts/rules/${id}`), "DELETE"),

  testAlertRule: (id: number) =>
    apiRequest<AlertSendResult>(path(`alerts/rules/${id}/test`), "POST"),

  /** Mutes for `minutes`; zero unmutes. */
  muteAlertRule: (id: number, minutes: number) =>
    apiRequest<AlertMuteResult>(path(`alerts/rules/${id}/mute`, { minutes }), "POST"),

  alertEvents: (q: AlertEventQuery = {}) =>
    apiRequest<Page<AlertEvent>>(path("alerts/events", { ...q })),

  firingAlerts: () => apiRequest<FiringAlert[]>(path("alerts/firing")),

  /** Threshold lines charts draw for a metric. */
  alertBands: (metric: string) =>
    apiRequest<AlertBand[]>(path("alerts/bands", { metric })),

  sendAlertDigest: () =>
    apiRequest<AlertSendResult>(path("alerts/digest"), "POST"),
};
