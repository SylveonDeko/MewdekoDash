// lib/api/multigreet/models/MultiGreet.ts

export interface MultiGreet {
  id: number;
  guildId: bigint;
  channelId: bigint;
  message: string | null;
  greetBots: boolean;
  deleteTime: number;
  webhookUrl: string | null;
  disabled: boolean;
  dateAdded: string | null;
}

export enum MultiGreetType {
  MultiGreet = 0,
  RandomGreet = 1,
  Off = 2,
}
