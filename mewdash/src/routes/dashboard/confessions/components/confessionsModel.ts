export const TABS = ["settings", "blacklist", "confessions"] as const;
export type TabId = (typeof TABS)[number];

export interface Named {
  id: string;
  name: string;
  color?: number;
}

export function idString(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

export function formatDate(value: string | null): string {
  if (!value) return "";
  const date = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
