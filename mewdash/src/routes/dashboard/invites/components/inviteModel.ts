export type Named = { id: string; name: string };
export type Role = { id: string; name: string; color?: number };
export type Member = { id: string; name: string; avatarUrl?: string };

export interface RowAction {
  label: string;
  icon: string;
  run: () => void;
}

export function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function idString(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

export function timeSpanToDays(span: string): number {
  const match = span.match(/^(?:(\d+)\.)?(\d+):(\d+):(\d+)/);
  if (!match) return 0;
  const days = parseInt(match[1] ?? "0", 10);
  const hours = parseInt(match[2], 10);
  return Math.round((days * 24 + hours) / 24);
}
