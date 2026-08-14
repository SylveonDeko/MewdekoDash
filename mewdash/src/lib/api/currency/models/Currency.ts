// lib/api/currency/models/Currency.ts
/**
 * What a shop item delivers to the buyer on purchase.
 * Mirrors Mewdeko.Database.Enums.ShopItemType.
 */
export enum ShopItemType {
  Role = 0,
  Collectible = 1,
  Text = 2,
}

/** A single row of the currency leaderboard, resolved to a Discord user. */
export interface LeaderboardEntry {
  rank: number;
  userId: bigint;
  username: string | null;
  avatarUrl: string | null;
  wallet: number;
  bank: number;
  netWorth: number;
  /** This user's share of the guild's money supply, 0 to 1. */
  shareOfSupply: number;
}

/** A page of the currency leaderboard. */
export interface LeaderboardPage {
  entries: LeaderboardEntry[];
  total: number;
  supply: number;
}

/** A ledger entry as returned by the balance endpoints. */
export interface CurrencyTransaction {
  id: number;
  amount: number;
  description: string | null;
  /** Broad classification, e.g. GameBet, Work, ShopPurchase. Never localized. */
  category: string;
  /** Specific originator, e.g. a game key. Null for older entries. */
  source: string | null;
  dateAdded: string;
}

/** A user's holdings plus their recent ledger entries. */
export interface UserBalance {
  userId: bigint;
  wallet: number;
  bank: number;
  netWorth: number;
  transactions: CurrencyTransaction[];
}

/** Current money supply and how concentrated it is. */
export interface EconomySnapshot {
  moneySupply: number;
  inWallets: number;
  inBanks: number;
  holders: number;
  mean: number;
  median: number;
  /** 0 for perfect equality, approaching 1 for total concentration. */
  gini: number;
  /** Share of supply held by the richest tenth of holders, 0 to 1. */
  topTenPercentShare: number;
  /** Net currency created minus destroyed over the window. */
  netChange: number;
}

/** Net currency created or destroyed by one ledger category. */
export interface FlowBucket {
  category: string;
  in: number;
  out: number;
  /** Positive means this category is a faucet. */
  net: number;
  entries: number;
}

/** Realized performance of one game over the window. */
export interface GamePerformance {
  game: string;
  wagered: number;
  returned: number;
  /** Return to player as a fraction of amount wagered. Above 1 means the game is inflating. */
  actualRtp: number;
  houseTake: number;
  plays: number;
  players: number;
}

/** Net change in the money supply on one day. */
export interface SupplyPoint {
  date: string;
  net: number;
}

/** Everything the analytics view needs, in one response. */
export interface EconomyAnalytics {
  snapshot: EconomySnapshot;
  flow: FlowBucket[];
  games: GamePerformance[];
  supplyHistory: SupplyPoint[];
  transferTax: number;
  windowDays: number;
}

/** A guild's economy tuning. Mirrors the CurrencyConfigs table. */
export interface EconomyConfig {
  id: number;
  guildId: bigint;

  minBet: number;
  maxBet: number;
  gamblingEnabled: boolean;
  payoutMultiplier: number;
  gameCooldownSeconds: number;
  lossLimitPerDay: number;

  payEnabled: boolean;
  payTaxPercent: number;
  payCooldownSeconds: number;
  payMinimum: number;

  bankEnabled: boolean;
  bankCapacity: number;
  bankInterestPercent: number;
  bankInterestHours: number;

  robEnabled: boolean;
  robSuccessChance: number;
  robMaxStealPercent: number;
  robFinePercent: number;
  robMinimumWallet: number;
  robCooldownSeconds: number;

  workEnabled: boolean;
  workMinReward: number;
  workMaxReward: number;
  workCooldownSeconds: number;

  crimeEnabled: boolean;
  crimeMinReward: number;
  crimeMaxReward: number;
  crimeSuccessChance: number;
  crimeFineMin: number;
  crimeFineMax: number;
  crimeCooldownSeconds: number;

  dailyStreakEnabled: boolean;
  dailyStreakBonus: number;
  dailyStreakMaxBonus: number;
}

/**
 * Partial economy settings update. Only the fields present are applied, so the
 * dashboard can send just what changed.
 */
export type UpdateEconomyConfigRequest = Partial<Omit<EconomyConfig, "id" | "guildId">>;

/** A shop item, with its roles resolved to names where they still exist. */
export interface ShopItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  itemType: ShopItemType;
  roleId: bigint | null;
  roleName: string | null;
  textContent: string | null;
  /** -1 means unlimited. */
  stock: number;
  /** 0 means unlimited. */
  maxPerUser: number;
  requiredRoleId: bigint | null;
  requiredRoleName: string | null;
  consumable: boolean;
  enabled: boolean;
  sortOrder: number;
  owned: number;
  revenue: number;
}

/** Payload for creating or replacing a shop item. */
export interface ShopItemRequest {
  name: string;
  description?: string | null;
  price: number;
  itemType: ShopItemType;
  roleId?: bigint | null;
  textContent?: string | null;
  stock: number;
  maxPerUser: number;
  requiredRoleId?: bigint | null;
  consumable: boolean;
  enabled: boolean;
  sortOrder: number;
}

/** One line of a user's inventory. */
export interface InventoryItem {
  id: number;
  name: string;
  description: string | null;
  itemType: ShopItemType;
  consumable: boolean;
  quantity: number;
  totalPaid: number;
}

/** Payload for adjusting a user's balance from the dashboard. */
export interface AdjustBalanceRequest {
  userId: bigint;
  amount: number;
  reason?: string | null;
}
