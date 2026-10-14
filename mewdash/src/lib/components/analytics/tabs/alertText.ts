import { m } from "$lib/i18n";
// lib/components/analytics/tabs/alertText.ts
import type { AlertRule, AlertRuleInput } from "$lib/api/analytics/models";
import { compact, duration, utcParse } from "../format";

const COMPARATOR_SYMBOL: Record<string, string> = {
  gt: ">",
  gte: "≥",
  lt: "<",
  lte: "≤",
  pct_change: "Δ%",
  deviates: "Δ%",
};

/** The short symbol or word drawn for a comparator; words are localized. */
export function comparatorSymbol(comparator: string): string {
  if (comparator === "outside") return m.analytics.tabAlertsCmpOutside();
  if (comparator === "nodata") return m.common.noDataLower();
  return COMPARATOR_SYMBOL[comparator] ?? comparator;
}

/** Full comparator name for select options. */
export function comparatorLabel(comparator: string): string {
  switch (comparator) {
    case "gt": return m.analytics.tabAlertsCmpLabelGt();
    case "gte": return m.analytics.tabAlertsCmpLabelGte();
    case "lt": return m.analytics.tabAlertsCmpLabelLt();
    case "lte": return m.analytics.tabAlertsCmpLabelLte();
    case "outside": return m.analytics.tabAlertsCmpLabelOutside();
    case "pct_change": return m.analytics.tabAlertsCmpLabelPctChange();
    case "deviates": return m.analytics.tabAlertsCmpLabelDeviates();
    case "nodata": return m.common.noDataLower();
    default: return comparator;
  }
}

export function severityLabel(severity: string): string {
  switch (severity) {
    case "info": return m.analytics.tabAlertsSeverityInfo();
    case "warning": return m.analytics.tabAlertsSeverityWarning();
    case "critical": return m.analytics.tabAlertsSeverityCritical();
    default: return severity;
  }
}

export function stateLabel(state: "firing" | "pending" | "ok" | "off"): string {
  switch (state) {
    case "firing": return m.analytics.tabAlertsStateFiring();
    case "pending": return m.analytics.tabAlertsStatePending();
    case "off": return m.analytics.tabAlertsStateOff();
    default: return m.analytics.tabAlertsStateOk();
  }
}

export const WINDOWS = [60, 300, 900, 1800, 3600, 21600, 86400];
export const FOR_SECONDS = [0, 60, 300, 900, 1800, 3600];
export const COOLDOWNS = [0, 300, 900, 1800, 3600, 21600, 86400];
export const REPEATS = [0, 900, 1800, 3600, 21600, 86400];
export const AGGREGATIONS = ["sum", "avg", "min", "max", "last", "rate", "count", "p50", "p95", "p99"];
export const COMPARATORS = ["gt", "gte", "lt", "lte", "outside", "pct_change", "deviates", "nodata"];

/** One line condition summary for a rule row. */
export function describe(rule: AlertRuleInput): string {
  const head = `${rule.aggregation}(${rule.metric})`;
  const window = duration(rule.windowSeconds);
  if (rule.comparator === "nodata") return m.analytics.tabAlertsDescNodata({ metric: rule.metric, window });
  if (rule.comparator === "outside") return m.analytics.tabAlertsDescOutside({ head, low: compact(rule.threshold), high: compact(rule.thresholdHigh), window });
  if (rule.comparator === "pct_change" || rule.comparator === "deviates") {
    const args = { head, pct: compact(rule.threshold), days: rule.baselineDays ?? 7, window };
    return rule.direction === "up" ? m.analytics.tabAlertsDescRises(args) : rule.direction === "down" ? m.analytics.tabAlertsDescFalls(args) : m.analytics.tabAlertsDescMoves(args);
  }
  return m.analytics.tabAlertsDescThreshold({ head, symbol: comparatorSymbol(rule.comparator), threshold: compact(rule.threshold), window });
}

export function worstState(rule: AlertRule): "firing" | "pending" | "ok" {
  const states = rule.states.map((s) => s.state);
  if (states.includes("firing")) return "firing";
  if (states.includes("pending")) return "pending";
  return "ok";
}

export function lastFired(rule: AlertRule): number {
  let best = NaN;
  for (const s of rule.states) {
    const t = utcParse(s.lastNotifiedAt);
    if (!Number.isNaN(t) && (Number.isNaN(best) || t > best)) best = t;
  }
  return best;
}

export function isMuted(rule: AlertRule): boolean {
  const until = utcParse(rule.mutedUntil);
  return !Number.isNaN(until) && until > Date.now();
}

export function toInput(rule: AlertRule): AlertRuleInput {
  return {
    name: rule.name,
    description: rule.description,
    enabled: rule.enabled,
    severity: rule.severity,
    metric: rule.metric,
    filters: { ...rule.filters },
    groupBy: rule.groupBy,
    aggregation: rule.aggregation,
    windowSeconds: rule.windowSeconds,
    comparator: rule.comparator,
    baselineDays: rule.baselineDays,
    direction: rule.direction,
    threshold: rule.threshold,
    thresholdHigh: rule.thresholdHigh,
    forSeconds: rule.forSeconds,
    cooldownSeconds: rule.cooldownSeconds,
    repeatSeconds: rule.repeatSeconds,
    webhookUrl: rule.webhookUrl,
    mentionRoleId: rule.mentionRoleId,
    threadId: rule.threadId,
    notifyOnResolve: rule.notifyOnResolve,
    quietStartMinute: rule.quietStartMinute,
    quietEndMinute: rule.quietEndMinute,
    minSamples: rule.minSamples,
  };
}

export function emptyInput(): AlertRuleInput {
  return {
    name: "",
    description: null,
    enabled: true,
    severity: "warning",
    metric: "",
    filters: {},
    groupBy: null,
    aggregation: "sum",
    windowSeconds: 300,
    comparator: "gt",
    baselineDays: null,
    direction: null,
    threshold: 0,
    thresholdHigh: null,
    forSeconds: 0,
    cooldownSeconds: 900,
    repeatSeconds: null,
    webhookUrl: "",
    mentionRoleId: null,
    threadId: null,
    notifyOnResolve: true,
    quietStartMinute: null,
    quietEndMinute: null,
    minSamples: null,
  };
}

export function minutesToClock(minutes: number | null): string {
  if (minutes === null || minutes === undefined) return "";
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${pad(Math.floor(minutes / 60) % 24)}:${pad(minutes % 60)}`;
}

export function clockToMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}
