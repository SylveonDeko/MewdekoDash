// lib/components/stats/format.ts

/** Formats a whole number with thousands separators. */
export function formatNumber(value: number | bigint | null | undefined): string {
  if (value === null || value === undefined) return "0";
  return new Intl.NumberFormat().format(typeof value === "bigint" ? Number(value) : value);
}

/** Formats seconds as a compact duration such as 3d 4h, 5h 12m or 42m. */
export function formatDuration(seconds: number | null | undefined): string {
  const total = Math.max(0, Math.floor(seconds ?? 0));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/** Formats seconds as decimal hours. */
export function formatHours(seconds: number | null | undefined): string {
  return `${((seconds ?? 0) / 3600).toFixed(1)}h`;
}

/** Formats a 0 to 1 ratio as a percentage, or a dash when unknown. */
export function formatPercent(ratio: number | null | undefined): string {
  if (ratio === null || ratio === undefined) return "-";
  return `${Math.round(ratio * 100)}%`;
}

/** Formats a signed change such as +12 or -3. */
export function formatSigned(value: number): string {
  if (value > 0) return `+${formatNumber(value)}`;
  return formatNumber(value);
}

/** Names a lookback window. */
export function windowLabel(days: number): string {
  if (days === 0) return "All time";
  if (days === 1) return "Last 24 hours";
  return `Last ${days} days`;
}

/** Formats an ISO timestamp as a short local date. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Formats an ISO timestamp as a short local date and time. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "-";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** Formats an ISO timestamp as "3 days ago" style text. */
export function formatAgo(iso: string | null | undefined): string {
  if (!iso) return "-";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "-";
  const seconds = Math.max(0, (Date.now() - then) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/** Formats a byte count as B, KB, MB or GB with one decimal above kilobytes. */
export function formatBytes(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) return "-";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(1)} ${units[unit]}`;
}

/** Triggers a browser download of a blob. */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** The lookback windows offered by stats pages. */
export const lookbackOptions = [
  { value: 1, label: "24h" },
  { value: 7, label: "7d" },
  { value: 14, label: "14d" },
  { value: 30, label: "30d" },
  { value: 90, label: "90d" },
  { value: 0, label: "All" },
];

/** The invite windows offered by invite pages, as StatsRange values. */
export const rangeOptions = [
  { value: 1, label: "24h" },
  { value: 2, label: "7d" },
  { value: 3, label: "30d" },
  { value: 0, label: "All" },
];
