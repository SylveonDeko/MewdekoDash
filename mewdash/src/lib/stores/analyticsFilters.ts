// lib/stores/analyticsFilters.ts
import { get, writable } from "svelte/store";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import type { FilterParams, TimeParams } from "$lib/api/analytics/models";

/** Global filter bar state, mirrored into the analytics page query string. */
export interface AnalyticsFilters {
  tab: string;
  range: string;
  from: string;
  to: string;
  bot: string;
  shard: string;
  guild: string;
  compare: boolean;
}

export const RANGE_SECONDS: Record<string, number> = {
  "15m": 900,
  "1h": 3600,
  "6h": 21600,
  "24h": 86400,
  "7d": 604800,
  "30d": 2592000,
};

export const DEFAULT_FILTERS: AnalyticsFilters = {
  tab: "overview",
  range: "24h",
  from: "",
  to: "",
  bot: "",
  shard: "",
  guild: "",
  compare: false,
};

export const analyticsFilters = writable<AnalyticsFilters>({ ...DEFAULT_FILTERS });

/** Bumped every 30s while the page is visible; data components reload on change. */
export const analyticsRefreshTick = writable(0);

export function readFilters(params: URLSearchParams): AnalyticsFilters {
  return {
    tab: params.get("tab") || DEFAULT_FILTERS.tab,
    range: params.get("range") || DEFAULT_FILTERS.range,
    from: params.get("from") || "",
    to: params.get("to") || "",
    bot: params.get("bot") || "",
    shard: params.get("shard") || "",
    guild: params.get("guild") || "",
    compare: params.get("compare") === "1",
  };
}

export function writeFilters(f: AnalyticsFilters): URLSearchParams {
  const q = new URLSearchParams();
  q.set("tab", f.tab);
  if (f.from && f.to) {
    q.set("from", f.from);
    q.set("to", f.to);
  } else if (f.range !== DEFAULT_FILTERS.range) {
    q.set("range", f.range);
  }
  if (f.bot) q.set("bot", f.bot);
  if (f.shard) q.set("shard", f.shard);
  if (f.guild) q.set("guild", f.guild);
  if (f.compare) q.set("compare", "1");
  return q;
}

export function rangeSeconds(f: AnalyticsFilters): number {
  if (f.from && f.to) return Math.max(60, (Date.parse(f.to) - Date.parse(f.from)) / 1000);
  return RANGE_SECONDS[f.range] ?? 86400;
}

/** Time window for the current filters, or the same width one period earlier when `shift`. */
export function timeParams(f: AnalyticsFilters, shift = false): TimeParams {
  if (f.from && f.to) {
    const span = Date.parse(f.to) - Date.parse(f.from);
    const offset = shift ? span : 0;
    return {
      from: new Date(Date.parse(f.from) - offset).toISOString(),
      to: new Date(Date.parse(f.to) - offset).toISOString(),
    };
  }
  if (shift) {
    const ms = rangeSeconds(f) * 1000;
    return {
      to: new Date(Date.now() - ms).toISOString(),
      from: new Date(Date.now() - ms * 2).toISOString(),
    };
  }
  return { range: f.range };
}

/**
 * Time window plus the label filters a component declares it honours
 * (`bot`, `shard`, `guild`), merged with any fixed label filters.
 */
export function queryParams(
  f: AnalyticsFilters,
  honours: string[] = ["bot", "shard"],
  fixed: Record<string, string> = {},
  shift = false,
): FilterParams {
  const labels: Record<string, string> = { ...fixed };
  const out: FilterParams = { ...timeParams(f, shift) };
  if (honours.includes("bot") && f.bot) out.bot = f.bot;
  if (honours.includes("shard") && f.shard) out.shard = f.shard;
  if (honours.includes("guild") && f.guild) labels.guild = f.guild;
  if (Object.keys(labels).length) out.labels = labels;
  return out;
}

export function syncFiltersToUrl(): void {
  const q = writeFilters(get(analyticsFilters)).toString();
  void goto(`${page.url.pathname}?${q}`, { replaceState: true, noScroll: true, keepFocus: true });
}
