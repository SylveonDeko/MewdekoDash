import { m } from "$lib/i18n";
import type { TodoItem, TodoListAccess } from "$lib/api/index.ts";

export type Notify = (message: string, type?: "success" | "error") => void;
export type Named = { id: string; name: string };

export const NO_ACCESS: TodoListAccess = {
  isOwner: false,
  canView: false,
  canAdd: false,
  canEdit: false,
  canComplete: false,
  canDelete: false,
  canManage: false
};

export const PRIORITY_COLORS: Record<number, string> = {
  1: "#10b981",
  2: "#3b82f6",
  3: "#f59e0b",
  4: "#ef4444"
};

export const DEFAULT_LIST_COLOR = "#7289da";

export function priorityLabel(priority: number): string {
  if (priority >= 4) return m.common.critical();
  if (priority === 3) return m.common.high();
  if (priority === 2) return m.common.medium();
  return m.todo.pagePriorityChipLow();
}

export function priorityOptions(): Array<{ id: string; name: string }> {
  return [1, 2, 3, 4].map(value => ({ id: String(value), name: priorityLabel(value) }));
}

export function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function sameId(a: unknown, b: unknown): boolean {
  return a != null && b != null && String(a) === String(b);
}

/** The bot sends UTC timestamps without a zone designator. */
export function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const utc = /[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`;
  const date = new Date(utc);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function dueInputValue(value: string | null | undefined): string {
  const date = toDate(value);
  if (!date) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function dueIso(dateInput: string): string | null {
  return dateInput ? `${dateInput}T12:00:00Z` : null;
}

export function isOverdue(item: TodoItem): boolean {
  const due = toDate(item.dueDate);
  if (!due || item.isCompleted) return false;
  const endOfDay = new Date(due);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay.getTime() < Date.now();
}
