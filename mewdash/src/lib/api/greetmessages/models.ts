/** Which message a request is about */
export type GreetMessageKind = "bye" | "dmgreet" | "boost";

/** A goodbye, DM welcome or boost message, as the bot reads and writes it */
export interface GreetMessage {
  enabled: boolean;
  /** Message text or embed JSON */
  message: string | null;
  /** Always null for DM welcomes */
  channelId: bigint | null;
  /** Seconds until deleted, 0 for never */
  deleteAfter: number;
}
