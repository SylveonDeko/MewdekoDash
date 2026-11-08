import { birthdayApi, type BirthdayConfig } from "$lib/api/index.ts";

export type Named = { id: string; name: string };
export type Role = { id: string; name: string; color?: number };
export type Member = { id: string; name: string; avatarUrl?: string };

export interface RowAction {
  label: string;
  icon: string;
  run: () => void;
}

export interface Form {
  channel: string | null;
  role: string | null;
  pingRole: string | null;
  message: string;
  ageMessage: string;
  hour: number;
  yearRule: number;
  features: number;
}

export type SaveMode = "now" | "typing";
export type Change = <K extends Exclude<keyof Form, "features">>(key: K, value: Form[K], mode?: SaveMode) => void;

export const Feature = { Announcements: 1, BirthdayRole: 2, PingRole: 8 } as const;
export type FeatureBit = (typeof Feature)[keyof typeof Feature];

const id = (value: string | null) => (value ? BigInt(value) : 0n);

type Senders = { [K in Exclude<keyof Form, "features">]: (guildId: bigint, value: Form[K]) => Promise<unknown> };

export const senders: Senders = {
  channel: (g, v) => birthdayApi.updateBirthdayConfig(g, { birthdayChannelId: id(v) }),
  role: (g, v) => birthdayApi.updateBirthdayConfig(g, { birthdayRoleId: id(v) }),
  pingRole: (g, v) => birthdayApi.updateBirthdayConfig(g, { birthdayPingRoleId: id(v) }),
  message: (g, v) => birthdayApi.updateBirthdayConfig(g, { birthdayMessage: v }),
  ageMessage: (g, v) => birthdayApi.updateBirthdayConfig(g, { ageMessage: v }),
  hour: (g, v) => birthdayApi.updateBirthdayConfig(g, { announcementHour: v }),
  yearRule: (g, v) => birthdayApi.updateBirthdayConfig(g, { birthYearRule: v })
};

function messageText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && Object.keys(value).length > 0) return JSON.stringify(value);
  return "";
}

export function toForm(config: BirthdayConfig): Form {
  return {
    channel: config.birthdayChannelId ? String(config.birthdayChannelId) : null,
    role: config.birthdayRoleId ? String(config.birthdayRoleId) : null,
    pingRole: config.birthdayPingRoleId ? String(config.birthdayPingRoleId) : null,
    message: messageText(config.birthdayMessage),
    ageMessage: config.ageMessage ?? "",
    hour: config.announcementHour ?? 0,
    yearRule: config.birthYearRule ?? 0,
    features: config.enabledFeatures
  };
}

export function hasFeature(features: number, bit: FeatureBit): boolean {
  return (features & bit) === bit;
}

export function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
