// lib/components/analytics/palette.ts

/** Categorical series colours that read on the dark dashboard surface. */
export const PALETTE = [
  "#7c78f5",
  "#f0834f",
  "#2fbf86",
  "#e8b13a",
  "#e66a99",
  "#4d9df0",
  "#a58cf4",
  "#f27272",
  "#3fc7c1",
  "#c9a24a",
  "#8fd15f",
  "#d98bd6",
];

export const GOOD = "#4ade80";
export const WARN = "#fdac41";
export const CRIT = "#f87171";
export const MUTED = "#9ca3af";

export const TEXT = "rgba(255,255,255,0.6)";
export const TEXT_STRONG = "rgba(255,255,255,0.85)";
export const GRID = "rgba(255,255,255,0.07)";
export const SURFACE = "#1a1f33";

export function seriesColor(name: string, index: number): string {
  if (name.startsWith("Other") || name === "unknown") return MUTED;
  return PALETTE[index % PALETTE.length];
}

export function severityColor(severity: string): string {
  const s = severity.toLowerCase();
  if (s === "critical" || s === "crit") return CRIT;
  if (s === "warning" || s === "warn") return WARN;
  return PALETTE[5];
}

export type PillTone = "ok" | "warn" | "crit" | "muted";

export function pillColor(tone: PillTone): string {
  return tone === "ok" ? GOOD : tone === "warn" ? WARN : tone === "crit" ? CRIT : MUTED;
}
