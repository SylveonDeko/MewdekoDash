// lib/api/freegames/models/FreeGame.ts

/** A channel that gets free game alerts. */
export interface FreeGameAlert {
  channelId: bigint;
  /** The role pinged with each alert, or null for no ping. */
  roleId: bigint | null;
  epic: boolean;
  steam: boolean;
  gog: boolean;
}

/** A game that is free to keep right now. */
export interface FreeGame {
  store: string;
  key: string;
  title: string;
  url: string;
  imageUrl: string | null;
  endsAt: string | null;
}
