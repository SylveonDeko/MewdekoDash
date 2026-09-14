// lib/components/analytics/tabs/alertText.ts
import type { AlertRule, AlertRuleInput } from "$lib/api/analytics/models";
import { compact, duration, utcParse } from "../format";

export const COMPARATOR_SYMBOL: Record<string, string> = {
  gt: ">",
  gte: "≥",
  lt: "<",
  lte: "≤",
  outside: "outside",
  pct_change: "Δ%",
  deviates: "Δ%",
  nodata: "no data",
};

export const WINDOWS = [60, 300, 900, 1800, 3600, 21600, 86400];
export const FOR_SECONDS = [0, 60, 300, 900, 1800, 3600];
export const COOLDOWNS = [0, 300, 900, 1800, 3600, 21600, 86400];
export const REPEATS = [0, 900, 1800, 3600, 21600, 86400];
export const AGGREGATIONS = ["sum", "avg", "min", "max", "last", "rate", "count", "p50", "p95", "p99"];
export const COMPARATORS = ["gt", "gte", "lt", "lte", "outside", "pct_change", "deviates", "nodata"];

/** One line condition summary for a rule row. */
export function describe(rule: AlertRuleInput): string {
  const head = `${rule.aggregation}(${rule.metric})`;
  if (rule.comparator === "nodata") return `${rule.metric} reports nothing for ${duration(rule.windowSeconds)}`;
  if (rule.comparator === "outside") return `${head} outside ${compact(rule.threshold)}–${compact(rule.thresholdHigh)} over ${duration(rule.windowSeconds)}`;
  if (rule.comparator === "pct_change" || rule.comparator === "deviates") {
    const dir = rule.direction === "up" ? "rises" : rule.direction === "down" ? "falls" : "moves";
    return `${head} ${dir} ${compact(rule.threshold)}% vs ${rule.baselineDays ?? 7}d baseline over ${duration(rule.windowSeconds)}`;
  }
  return `${head} ${COMPARATOR_SYMBOL[rule.comparator] ?? rule.comparator} ${compact(rule.threshold)} over ${duration(rule.windowSeconds)}`;
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
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}
