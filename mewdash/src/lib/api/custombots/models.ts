// lib/api/custombots/models.ts

export type CustomBotStatus = "running" | "stopped" | "starting" | "error" | "expired";

export interface CustomBotSlot {
  id: number | string;
  source: string;
  expiresAt: string | null;
  instanceId: string | null;
}

export interface CustomBotGuild {
  id: string;
  name: string;
  icon: string | null;
  assigned: boolean;
}

export interface CustomBot {
  instanceId: string;
  botId: string;
  name: string;
  avatar: string | null;
  status: CustomBotStatus;
  guilds: CustomBotGuild[];
  createdAt: string;
  expiresAt: string | null;
  inviteUrl: string | null;
}

export interface CustomBotUserState {
  slots: CustomBotSlot[];
  bots: CustomBot[];
}

export interface CustomBotGuildInfo {
  instanceId: string | null;
  botName: string | null;
  botAvatar: string | null;
}

export interface CustomBotLogs {
  lines: string[];
}

export interface CustomBotSlotGrant {
  userId: string;
  days?: number;
}

/** One row of the owner listing, with every field past the slot optional. */
export interface CustomBotOwnerSlot extends CustomBotSlot {
  userId?: string | null;
  bot?: CustomBot | null;
}

export type CustomBotOwnerList = CustomBotUserState | CustomBotOwnerSlot[];
