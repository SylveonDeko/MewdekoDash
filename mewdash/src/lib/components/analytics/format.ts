// lib/components/analytics/format.ts

export type ValueFormat = "int" | "compact" | "ms" | "pct" | "bytes" | "float" | "seconds";

const missing = (x: unknown): x is null | undefined =>
  x === null || x === undefined || (typeof x === "number" && Number.isNaN(x));

export function n(x: number | null | undefined): string {
  return missing(x) ? "—" : Math.round(x).toLocaleString("en-US");
}

export function compact(x: number | null | undefined): string {
  if (missing(x)) return "—";
  const a = Math.abs(x);
  if (a >= 1e9) return `${(x / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `${(x / 1e6).toFixed(2)}M`;
  if (a >= 1e3) return `${(x / 1e3).toFixed(1)}k`;
  if (a >= 10 || Number.isInteger(x)) return Math.round(x).toString();
  return x.toFixed(2).replace(/\.?0+$/, "");
}

export function ms(x: number | null | undefined): string {
  return missing(x) ? "—" : `${Math.round(x).toLocaleString("en-US")} ms`;
}

export function pct(x: number | null | undefined, digits = 1): string {
  return missing(x) ? "—" : `${x.toFixed(digits)}%`;
}

export function bytes(x: number | null | undefined): string {
  if (missing(x)) return "—";
  if (x >= 1073741824) return `${(x / 1073741824).toFixed(2)} GB`;
  if (x >= 1048576) return `${(x / 1048576).toFixed(0)} MB`;
  return `${Math.round(x / 1024)} KB`;
}

export function duration(seconds: number | null | undefined): string {
  if (missing(seconds)) return "—";
  if (seconds < 60) return `${Math.round(seconds)} s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} m`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} h`;
  return `${(seconds / 86400).toFixed(1)} d`;
}

export function fmt(value: number | null | undefined, format: ValueFormat = "int"): string {
  switch (format) {
    case "ms":
      return ms(value);
    case "pct":
      return pct(value);
    case "bytes":
      return bytes(value);
    case "compact":
      return compact(value);
    case "float":
      return missing(value) ? "—" : value.toFixed(2);
    case "seconds":
      return duration(value);
    default:
      return n(value);
  }
}

/** Parses timestamps the bot returns without an offset as UTC. */
export function utcParse(value: string | null | undefined): number {
  if (!value) return NaN;
  return Date.parse(/[Zz]$|[+-]\d\d:\d\d$/.test(value) ? value : `${value}Z`);
}

export function ago(value: string | null | undefined): string {
  const parsed = utcParse(value);
  return Number.isNaN(parsed) ? "—" : `${duration((Date.now() - parsed) / 1000)} ago`;
}

export function stamp(value: string | null | undefined): string {
  const parsed = utcParse(value);
  return Number.isNaN(parsed) ? "—" : new Date(parsed).toISOString().replace("T", " ").slice(0, 16);
}

export function clock(value: string | null | undefined): string {
  const parsed = utcParse(value);
  return Number.isNaN(parsed) ? "—" : new Date(parsed).toISOString().slice(11, 19);
}

export function bucketLabel(unix: number, resolution: number, rangeSecs: number): string {
  const d = new Date(unix * 1000);
  const pad = (v: number) => String(v).padStart(2, "0");
  if (resolution >= 60 && rangeSecs > 259200) return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

export function dayLabel(value: string | null | undefined): string {
  const parsed = utcParse(value);
  return Number.isNaN(parsed) ? "—" : new Date(parsed).toISOString().slice(5, 10);
}

export function usd(x: number | null | undefined): string {
  return missing(x) ? "—" : `$${x.toFixed(x >= 100 ? 0 : 2)}`;
}

export function truncate(value: string | null | undefined, max: number): string {
  if (!value) return "";
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}
