// lib/api/analytics/models.ts

/** Preset ranges the analytics API understands. */
export type AnalyticsRange = "15m" | "1h" | "6h" | "24h" | "7d" | "30d";

/** Aggregations the series and aggregate endpoints support. */
export type AnalyticsAgg =
  | "sum"
  | "avg"
  | "min"
  | "max"
  | "last"
  | "rate"
  | "p50"
  | "p95"
  | "p99"
  | "count";

/** Either a preset range or an explicit ISO UTC window. */
export interface TimeParams {
  range?: AnalyticsRange | string;
  from?: string;
  to?: string;
}

/** Instance and shard filters plus arbitrary label filters, sent as `f.<label>`. */
export interface FilterParams extends TimeParams {
  bot?: string;
  shard?: string;
  labels?: Record<string, string>;
}

/** One page of a list. */
export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface SeriesQuery extends FilterParams {
  metric: string;
  agg: AnalyticsAgg;
  groupBy?: string;
  max?: number;
  /** Forced bucket width in minutes: 1, 5 or 60. */
  res?: number;
}

export interface SeriesPoint {
  bucketUnix: number;
  value: number | null;
}

export interface Series {
  name: string;
  labels: Record<string, string>;
  points: SeriesPoint[];
}

export interface SeriesResult {
  /** Bucket width in minutes. */
  resolution: number;
  series: Series[];
  truncated: boolean;
}

export interface AggregateQuery extends FilterParams {
  metric: string;
  agg: AnalyticsAgg;
}

export interface AggregateResult {
  value: number | null;
}

export interface BreakdownQuery extends FilterParams {
  metric: string;
  label: string;
  agg?: AnalyticsAgg;
  limit?: number;
}

export interface BreakdownRow {
  name: string;
  value: number;
}

export interface MetricDescriptor {
  metric: string;
  kind: "counter" | "gauge" | "histogram" | string;
  labels: Record<string, string[]>;
  lastSeen: string;
}

export interface CommandQuery extends FilterParams {
  kind?: string;
  module?: string;
  command?: string;
  guild?: string;
  ok?: boolean;
  limit?: number;
}

export interface InvocationQuery extends CommandQuery {
  page?: number;
  pageSize?: number;
}

export interface TopCommandRow {
  command: string;
  module: string | null;
  count: number;
  failures: number;
  failureRate: number;
  avgMs: number | null;
  p95Ms: number | null;
  guilds: number;
}

export interface FailingCommandRow {
  command: string;
  module: string | null;
  errorClass: string;
  count: number;
  lastSeen: string;
  lastMessage: string | null;
}

export interface InvocationRow {
  id: number;
  at: string;
  bot: string;
  shard: number | null;
  guildId: string | null;
  guildSize: number | null;
  kind: string;
  module: string | null;
  command: string;
  ok: boolean;
  errorClass: string | null;
  errorMessage: string | null;
  durationMs: number;
  ackMs: number | null;
  language: string | null;
}

export type InvocationPage = Page<InvocationRow>;

export interface CommandErrorSampleQuery extends TimeParams {
  command: string;
  error: string;
  limit?: number;
}

export interface CommandErrorSampleRow {
  at: string;
  guildId: string | null;
  kind: string;
  module: string | null;
  message: string | null;
  durationMs: number;
}

export interface HeatmapCell {
  hour: number;
  size: string;
  count: number;
}

export interface UsageHeatmap {
  sizes: string[];
  cells: HeatmapCell[];
}

export interface EventCountRow {
  type: string;
  count: number;
}

export interface TopGuildRow {
  guildId: string;
  name: string | null;
  memberCount: number | null;
  events: number;
  topTypes: EventCountRow[];
}

export interface GuildAnomalyRow {
  guildId: string;
  name: string | null;
  eventType: string;
  hour: string;
  count: number;
  mean: number;
  stdDev: number;
  z: number;
}

export interface GuildTimelineCell {
  hour: string;
  type: string;
  count: number;
}

export interface GuildTimeline {
  guildId: string;
  types: string[];
  cells: GuildTimelineCell[];
}

export interface GuildEventRow {
  id: number;
  at: string;
  eventType: string;
  bot: string;
  shard: number | null;
}

export interface GuildEventQuery extends TimeParams {
  eventType?: string;
  page?: number;
  pageSize?: number;
}

export interface FeatureUse {
  feature: string;
  count: number;
  errors: number;
}

export interface GuildShape {
  memberCount: number;
  humans: number;
  bots: number;
  online: number;
  boosts: number;
  boostTier: number;
  channels: number;
  roles: number;
  ownerId: string;
  createdAt: string;
}

export interface CommandUse {
  command: string;
  count: number;
  failures: number;
}

export interface GuildCard {
  guildId: string;
  name: string | null;
  memberCount: number | null;
  shard: number | null;
  joinedAt: string | null;
  present: boolean;
  commands: number;
  events: number;
  features: FeatureUse[];
  shape: GuildShape | null;
  configuredFeatures: string[];
  enabledFeatures: string[];
  topCommands: CommandUse[];
}

export interface GuildOverviewRow {
  guildId: string;
  name: string;
  shard: number;
  shape: GuildShape;
  joinedAt: string | null;
  commands: number;
  events: number;
  featuresUsed: number;
  featuresConfigured: number;
  featuresEnabled: number;
  features: string[];
}

export interface FeatureAdoptionRow {
  feature: string;
  activeGuilds: number;
  activity: number;
  errors: number;
  configured: number | null;
  enabled: number | null;
}

export interface FeatureDepthBucket {
  features: number;
  guilds: number;
}

export interface FeatureDepthPoint {
  guildId: string;
  memberCount: number | null;
  features: number;
}

export interface FeatureDepth {
  histogram: FeatureDepthBucket[];
  points: FeatureDepthPoint[];
}

export interface SettingUsageRow {
  metric: string;
  table: string;
  column: string;
  value: string;
  count: number;
}

export interface DayValue {
  day: string;
  value: number;
}

export interface SnapshotRow {
  day: string;
  bot: string;
  guilds: number;
  users: number;
  features: Record<string, number> | null;
}

export interface ChurnDay {
  day: string;
  joins: number;
  leaves: number;
}

export interface ChurnSummary {
  joins: number;
  leaves: number;
  net: number;
  bounced: number;
  bounceRate: number | null;
  joinsBySize: BreakdownRow[];
  leavesBySize: BreakdownRow[];
  days: ChurnDay[];
}

export interface RetentionPoint {
  day: string;
  joined: number;
  retained: number;
  rate: number | null;
}

export interface BouncedGuildRow {
  guildId: string;
  firstSeen: string;
  lastSeen: string;
  events: number;
}

export interface SilentGuildRow {
  guildId: string;
  name: string | null;
  memberCount: number | null;
  lastActive: string;
  events: number;
}

export interface ErrorGroupQuery extends TimeParams {
  bot?: string;
  limit?: number;
}

export interface ErrorGroupRow {
  type: string;
  module: string | null;
  location: string | null;
  hash: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  lastMessage: string | null;
}

export interface ErrorSampleQuery extends TimeParams {
  bot?: string;
  type: string;
  module?: string;
  hash?: string;
  limit?: number;
}

export interface ErrorOccurrenceRow {
  hour: string;
  bot: string;
  shard: number | null;
  location: string | null;
  message: string | null;
  count: number;
  firstSeen: string;
  lastSeen: string;
  lastGuildId: string | null;
}

export interface AiModelRow {
  model: string;
  provider: string | null;
  requests: number;
  failures: number;
  tokensIn: number;
  tokensOut: number;
  p95Ms: number | null;
  costUsd: number | null;
}

export interface AiSummary {
  models: AiModelRow[];
  requests: number;
  tokensIn: number;
  tokensOut: number;
  costUsd: number | null;
}

export interface AiGuildRow {
  guildId: string;
  name: string | null;
  count: number;
  errors: number;
}

export interface RouteRow {
  route: string;
  views: number;
  visitors: number;
  p95Ms: number | null;
  errors: number;
}

export interface RouteErrorRow {
  route: string;
  status: number;
  count: number;
  lastSeen: string;
}

export interface WebsiteFunnel {
  loginViews: number;
  loginVisitors: number;
  callbackViews: number;
  callbackVisitors: number;
  dashboardViews: number;
  dashboardVisitors: number;
}

export interface PipelineTable {
  table: string;
  rows: number;
  newest: string | null;
}

export interface PipelineInstance {
  botId: string;
  botName: string;
  host: string;
  port: number;
  isActive: boolean;
  lastStatusUpdate: string;
  lastGuildCountAt: string | null;
}

export interface PipelineHealth {
  enabled: boolean;
  lastFlushAt: string | null;
  lastRollupAt: string | null;
  lastMaintenanceAt: string | null;
  lastError: string | null;
  pendingSeries: number;
  pendingRows: number;
  tables: PipelineTable[];
  instances: PipelineInstance[];
}

export type AlertSeverity = "info" | "warning" | "critical";

export type AlertComparator =
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "outside"
  | "pct_change"
  | "deviates"
  | "nodata";

export interface AlertGroupState {
  groupKey: string;
  state: "ok" | "pending" | "firing" | string;
  since: string;
  lastValue: number | null;
  lastNotifiedAt: string | null;
}

export interface AlertRuleInput {
  name: string;
  description: string | null;
  enabled: boolean;
  severity: AlertSeverity | string;
  metric: string;
  filters: Record<string, string>;
  groupBy: string | null;
  aggregation: AnalyticsAgg | string;
  windowSeconds: number;
  comparator: AlertComparator | string;
  baselineDays: number | null;
  direction: string | null;
  threshold: number;
  thresholdHigh: number | null;
  forSeconds: number;
  cooldownSeconds: number;
  repeatSeconds: number | null;
  webhookUrl: string;
  mentionRoleId: string | null;
  threadId: string | null;
  notifyOnResolve: boolean;
  quietStartMinute: number | null;
  quietEndMinute: number | null;
  minSamples: number | null;
}

export interface AlertRule extends AlertRuleInput {
  id: number;
  mutedUntil: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  states: AlertGroupState[];
  firedLast30Days: number;
}

export interface AlertEvent {
  id: number;
  ruleId: number;
  ruleName: string;
  severity: string;
  groupKey: string;
  at: string;
  fromState: string;
  toState: string;
  value: number | null;
  threshold: number;
  notified: boolean;
}

export interface AlertEventQuery {
  page?: number;
  pageSize?: number;
  ruleId?: number;
}

export interface FiringAlert {
  ruleId: number;
  ruleName: string;
  severity: string;
  metric: string;
  groupKey: string;
  since: string;
  lastValue: number | null;
  threshold: number;
}

export interface AlertBand {
  id: number;
  name: string;
  threshold: number;
  thresholdHigh: number | null;
  comparator: string;
  severity: string;
}

export interface AlertSendResult {
  success: boolean;
}

export interface AlertMuteResult {
  mutedUntil: string | null;
}

export interface PageViewSample {
  at: string;
  route: string;
  method: string;
  status: number;
  durationMs: number;
  visitorHash: string | null;
  locale: string | null;
  device: string | null;
  guildSize: number | null;
  isOwner: boolean;
}
