export type TabId = "setup" | "roles" | "stats";

export const TABS: TabId[] = ["setup", "roles", "stats"];

export type Named = { id: string; name: string; color?: number };

export type Notify = (message: string, type?: "success" | "error") => void;

export const MAX_SECONDS = 2147483647;

export const UNIT_SECONDS = { seconds: 1, minutes: 60, hours: 3600, days: 86400 } as const;

export function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function bestUnit(seconds: number): string {
  if (seconds <= 0) return String(UNIT_SECONDS.hours);
  for (const factor of [UNIT_SECONDS.days, UNIT_SECONDS.hours, UNIT_SECONDS.minutes]) {
    if (seconds % factor === 0) return String(factor);
  }
  return String(UNIT_SECONDS.seconds);
}

export function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleString() : "";
}

export function randomPassword(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}
