import type { EconomyConfig, UpdateEconomyConfigRequest } from "$lib/api/currency/models";

export type PresetId = "casual" | "balanced" | "competitive";

export type PresetValues = Required<
  Pick<
    UpdateEconomyConfigRequest,
    | "gamblingEnabled" | "minBet" | "maxBet" | "payoutMultiplier" | "gameCooldownSeconds" | "lossLimitPerDay"
    | "workEnabled" | "workMinReward" | "workMaxReward" | "workCooldownSeconds"
    | "crimeEnabled" | "crimeMinReward" | "crimeMaxReward" | "crimeSuccessChance" | "crimeFineMin" | "crimeFineMax" | "crimeCooldownSeconds"
    | "robEnabled" | "robSuccessChance" | "robMaxStealPercent" | "robFinePercent" | "robMinimumWallet" | "robCooldownSeconds"
    | "bankEnabled" | "bankCapacity" | "bankInterestPercent" | "bankInterestHours"
    | "payEnabled" | "payTaxPercent" | "payCooldownSeconds" | "payMinimum"
    | "dailyStreakEnabled" | "dailyStreakBonus" | "dailyStreakMaxBonus"
  >
>;

export interface Preset {
  id: PresetId;
  icon: string;
  values: PresetValues;
}

export const PRESETS: readonly Preset[] = [
  {
    id: "casual",
    icon: "fa-face-smile",
    values: {
      gamblingEnabled: true, minBet: 1, maxBet: 5000, payoutMultiplier: 1.25, gameCooldownSeconds: 3, lossLimitPerDay: 0,
      workEnabled: true, workMinReward: 100, workMaxReward: 300, workCooldownSeconds: 1800,
      crimeEnabled: false, crimeMinReward: 100, crimeMaxReward: 400, crimeSuccessChance: 60, crimeFineMin: 50, crimeFineMax: 150, crimeCooldownSeconds: 3600,
      robEnabled: false, robSuccessChance: 30, robMaxStealPercent: 10, robFinePercent: 25, robMinimumWallet: 500, robCooldownSeconds: 7200,
      bankEnabled: true, bankCapacity: 0, bankInterestPercent: 1, bankInterestHours: 24,
      payEnabled: true, payTaxPercent: 0, payCooldownSeconds: 0, payMinimum: 1,
      dailyStreakEnabled: true, dailyStreakBonus: 10, dailyStreakMaxBonus: 100
    }
  },
  {
    id: "balanced",
    icon: "fa-scale-balanced",
    values: {
      gamblingEnabled: true, minBet: 10, maxBet: 10000, payoutMultiplier: 1, gameCooldownSeconds: 5, lossLimitPerDay: 20000,
      workEnabled: true, workMinReward: 50, workMaxReward: 250, workCooldownSeconds: 1800,
      crimeEnabled: true, crimeMinReward: 200, crimeMaxReward: 800, crimeSuccessChance: 45, crimeFineMin: 100, crimeFineMax: 500, crimeCooldownSeconds: 3600,
      robEnabled: true, robSuccessChance: 35, robMaxStealPercent: 20, robFinePercent: 15, robMinimumWallet: 100, robCooldownSeconds: 3600,
      bankEnabled: true, bankCapacity: 100000, bankInterestPercent: 0.5, bankInterestHours: 24,
      payEnabled: true, payTaxPercent: 2, payCooldownSeconds: 30, payMinimum: 1,
      dailyStreakEnabled: true, dailyStreakBonus: 5, dailyStreakMaxBonus: 50
    }
  },
  {
    id: "competitive",
    icon: "fa-trophy",
    values: {
      gamblingEnabled: true, minBet: 50, maxBet: 5000, payoutMultiplier: 0.9, gameCooldownSeconds: 10, lossLimitPerDay: 10000,
      workEnabled: true, workMinReward: 40, workMaxReward: 150, workCooldownSeconds: 3600,
      crimeEnabled: true, crimeMinReward: 300, crimeMaxReward: 1500, crimeSuccessChance: 40, crimeFineMin: 300, crimeFineMax: 1200, crimeCooldownSeconds: 2700,
      robEnabled: true, robSuccessChance: 40, robMaxStealPercent: 30, robFinePercent: 25, robMinimumWallet: 250, robCooldownSeconds: 1800,
      bankEnabled: true, bankCapacity: 25000, bankInterestPercent: 0, bankInterestHours: 24,
      payEnabled: true, payTaxPercent: 10, payCooldownSeconds: 60, payMinimum: 10,
      dailyStreakEnabled: true, dailyStreakBonus: 5, dailyStreakMaxBonus: 25
    }
  }
];

export function matchPreset(config: EconomyConfig): PresetId | null {
  const match = PRESETS.find((preset) =>
    (Object.keys(preset.values) as (keyof PresetValues)[]).every((key) => config[key] === preset.values[key])
  );
  return match?.id ?? null;
}
