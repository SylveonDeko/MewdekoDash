// lib/api/statusroles/models/StatusRole.ts

export interface StatusRole {
  id: number;
  guildId: bigint;
  status: string;
  toAdd: string;
  toRemove: string;
  statusChannelId: bigint | null;
  statusEmbed: string | null;
  removeAdded: boolean;
  readdRemoved: boolean;
}
