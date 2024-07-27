export type DiscordGuild = {
  id: bigint;
  name: string;
  icon: string;
  owner: boolean;
  permissions: number;
  features: string[] | null;
};