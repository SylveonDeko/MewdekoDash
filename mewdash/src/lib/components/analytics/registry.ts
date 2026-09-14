// lib/components/analytics/registry.ts
import { analyticsApi } from "$lib/api/analytics/analytics";
import type { MetricDescriptor } from "$lib/api/analytics/models";
import { logger } from "$lib/logger";

let cached: Promise<MetricDescriptor[]> | null = null;
let cachedAt = 0;
const TTL_MS = 5 * 60_000;

/** The metric registry, shared across components and refreshed every five minutes. */
export function metricRegistry(force = false): Promise<MetricDescriptor[]> {
  if (!cached || force || Date.now() - cachedAt > TTL_MS) {
    cachedAt = Date.now();
    cached = analyticsApi.metrics().catch((err) => {
      logger.warn("Analytics metric registry failed", err);
      cached = null;
      return [];
    });
  }
  return cached;
}

/** Label keys a metric carries, `bot` excluded since the filter bar owns it. */
export async function metricLabels(metric: string): Promise<string[]> {
  const registry = await metricRegistry();
  const entry = registry.find((m) => m.metric === metric);
  return Object.keys(entry?.labels ?? {}).filter((l) => l !== "bot");
}

/** Sample values the registry has seen for one label on one metric. */
export async function labelValues(metric: string, label: string): Promise<string[]> {
  const registry = await metricRegistry();
  const entry = registry.find((m) => m.metric === metric);
  return [...(entry?.labels?.[label] ?? [])].sort((a, b) => {
    const na = Number(a);
    const nb = Number(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    return a.localeCompare(b);
  });
}
