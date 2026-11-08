import { m } from "$lib/i18n";
import type { FeatureRequestCategory, FeatureRequestStatus } from "$lib/api/featurerequests/models";

export type Notify = (message: string, type?: "success" | "error") => void;

export type TabId = "browse" | "suggest" | "mine" | "settings";

export const TITLE_MAX = 120;
export const TITLE_MIN = 3;
export const BODY_MAX = 2000;
export const BODY_MIN = 10;
export const NOTE_MAX = 1000;

export function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function categoryOptions(): Array<{ id: FeatureRequestCategory; name: string }> {
  return [
    { id: "feature", name: m.featureRequests.categoryFeature() },
    { id: "bug", name: m.featureRequests.categoryBug() },
    { id: "other", name: m.featureRequests.categoryOther() }
  ];
}

export function statusOptions(): Array<{ id: FeatureRequestStatus; name: string }> {
  return [
    { id: "open", name: m.common.open() },
    { id: "planned", name: m.featureRequests.statusPlanned() },
    { id: "done", name: m.common.done() },
    { id: "declined", name: m.featureRequests.statusDeclined() }
  ];
}

export function categoryIcon(category: FeatureRequestCategory): string {
  if (category === "bug") return "fa-solid fa-bug";
  if (category === "other") return "fa-solid fa-comments";
  return "fa-solid fa-lightbulb";
}

/** The bot sends UTC timestamps without a zone designator. */
export function formatDate(value: string | null): string {
  if (!value) return m.common.unknown();
  const utc = /[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`;
  return new Date(utc).toLocaleString();
}
