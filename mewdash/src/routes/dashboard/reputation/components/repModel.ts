export type Named = { id: string; name: string; color?: number };
export type Notify = (message: string, type?: "success" | "error") => void;

export function idString(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

export function utcDate(value: string): Date {
  return new Date(value.endsWith("Z") || value.includes("+") ? value : `${value}Z`);
}
