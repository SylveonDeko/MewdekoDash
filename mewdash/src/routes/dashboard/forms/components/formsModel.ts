import type { Form } from "$lib/api/index.ts";

export const TABS = ["forms", "responses", "defaults"] as const;
export type TabId = (typeof TABS)[number];

export interface Named {
  id: string;
  name: string;
  color?: number;
}

export interface MenuItem {
  label: string;
  icon: string;
  onclick: () => void;
  hidden?: boolean;
}

export type Notify = (message: string, type?: "success" | "error") => void;

export function idString(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function errorText(err: unknown, fallback: string): string {
  const reasons = (err as { body?: { errors?: unknown } } | null)?.body?.errors;
  if (Array.isArray(reasons) && reasons.length > 0) return reasons.join(". ");
  return err instanceof Error && err.message ? err.message : fallback;
}

export function isExpired(form: Form): boolean {
  return !!form.expiresAt && new Date(form.expiresAt).getTime() < Date.now();
}

export function isReviewed(form: Form): boolean {
  return form.requireApproval || form.formType !== 0;
}

export function sanitizeForms(forms: Form[]): Form[] {
  return forms.map((form) => ({
    ...form,
    expiresAt: form.expiresAt && form.expiresAt !== "-infinity" && form.expiresAt !== "infinity" ? form.expiresAt : null
  }));
}
