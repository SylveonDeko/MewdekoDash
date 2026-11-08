import { m } from "$lib/i18n";
import { PollType, type PollTemplateResponse } from "$lib/api/index.ts";

export type Named = { id: string; name: string };
export type Role = { id: string; name: string; color?: number };

export interface RowAction {
  label: string;
  icon: string;
  run: () => void;
}

export interface PollDraft {
  question: string;
  options: string[];
  type: string;
  channelId: string | null;
  durationMinutes: number | null;
  maxVotes: number | null;
  allowedRoles: string[];
  blockedRoles: string[];
  allowVoteChanges: boolean;
  showResults: boolean;
  showProgressBars: boolean;
  resultsMessage: string;
  scheduleFor: string;
  saveAsTemplate: boolean;
  templateName: string;
}

export function emptyDraft(): PollDraft {
  return {
    question: "",
    options: ["", ""],
    type: PollType.SingleChoice.toString(),
    channelId: null,
    durationMinutes: null,
    maxVotes: null,
    allowedRoles: [],
    blockedRoles: [],
    allowVoteChanges: true,
    showResults: true,
    showProgressBars: true,
    resultsMessage: "",
    scheduleFor: "",
    saveAsTemplate: false,
    templateName: ""
  };
}

export function draftFromTemplate(template: PollTemplateResponse): PollDraft {
  let options: string[] = [];
  let settings: any = {};
  try {
    const parsed = JSON.parse(template.options);
    options = Array.isArray(parsed)
      ? parsed.map((o: any) => (typeof o === "string" ? o : (o?.text ?? o?.Text ?? ""))).filter(Boolean)
      : [];
  } catch {
    options = [];
  }
  try {
    settings = template.settings ? JSON.parse(template.settings) : {};
  } catch {
    settings = {};
  }
  const type = settings.defaultType ?? settings.DefaultType ?? settings.type ?? settings.Type ?? PollType.SingleChoice;
  return {
    ...emptyDraft(),
    question: template.question,
    options: options.length >= 2 ? options : ["", ""],
    type: String(type),
    allowVoteChanges: settings.allowVoteChanges ?? settings.AllowVoteChanges ?? true,
    showResults: settings.showResults ?? settings.ShowResults ?? true
  };
}

export function typeLabel(type: number): string {
  return (
    {
      [PollType.YesNo]: m.polls.typeYesNo(),
      [PollType.SingleChoice]: m.polls.typeSingle(),
      [PollType.MultiChoice]: m.common.multipleChoice(),
      [PollType.Anonymous]: m.common.anonymous(),
      [PollType.RoleRestricted]: m.polls.typeRoleRestricted()
    }[type] ?? m.common.poll()
  );
}

export function timeLeft(expiresAt: string | null): string {
  if (!expiresAt) return m.polls.timeNoEnd();
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return m.common.ended();
  const mins = Math.round(ms / 60000);
  if (mins < 60) return m.polls.timeMinutesLeft({ count: mins });
  const hours = Math.round(mins / 60);
  if (hours < 48) return m.polls.timeHoursLeft({ count: hours });
  return m.polls.timeDaysLeft({ count: Math.round(hours / 24) });
}

export function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleString() : "";
}

export function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
