import { m } from "$lib/i18n";
import type { EconomyConfig } from "$lib/api/currency/models";

export type Named = { id: string; name: string; color?: number };
export type Notify = (message: string, type?: "success" | "error" | "warning") => void;

type KeysOfType<T, V> = { [K in keyof T]: T[K] extends V ? K : never }[keyof T];
export type BoolSetting = KeysOfType<EconomyConfig, boolean>;
export type NumberSetting = Exclude<KeysOfType<EconomyConfig, number>, "id">;

export const DECIMAL_SETTINGS = new Set<NumberSetting>(["payoutMultiplier", "bankInterestPercent"]);

export const BOOST_EARNING = ["daily", "work", "crime", "rob"];
export const BOOST_GAMES = [
  "coinflip", "highlow", "blackjack", "slots", "roulette", "rps", "war", "craps", "scratchcard",
  "russianroulette", "baccarat", "minesweeper", "lottery", "crash", "keno", "plinko", "wheelfortune",
  "spinwheel", "duckrace", "bingo", "memory", "horserace", "diceduel", "triviachain"
];

export function idString(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

export function formatNumber(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString();
}

export function formatSigned(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toLocaleString()}`;
}

export function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatDuration(seconds: number): string {
  if (seconds <= 0) return m.common.noneLower();
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${(seconds / 3600).toFixed(seconds % 3600 === 0 ? 0 : 1)}h`;
}

export function winTotal(stake: number, gameMultiplier: number, payoutMultiplier: number): number {
  return stake + Math.round(stake * (gameMultiplier - 1) * payoutMultiplier);
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${+(minutes / 60).toFixed(1)}h`;
  return `${+(minutes / 1440).toFixed(1)}d`;
}

export function utcDate(value: string): Date {
  return new Date(value.endsWith("Z") || value.includes("+") ? value : `${value}Z`);
}
