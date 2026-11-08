import { m } from "$lib/i18n";
import type { PurgeFilter } from "$lib/api/index.ts";
import type { AutoSave } from "$lib/utils/autoSave.svelte";
import type { DiscordUser } from "$lib/types/discord.ts";

export type Named = { id: string; name: string; color?: number };

export type Notify = (message: string, type?: "success" | "error") => void;

export type TabId = "automation" | "commands" | "roles" | "backups" | "channels" | "advanced";

export const TABS: TabId[] = ["automation", "commands", "roles", "backups", "channels", "advanced"];

export interface TabProps {
  guildId: bigint;
  channels: Named[];
  textChannels: Named[];
  voiceChannels: Named[];
  roles: Named[];
  autoSave: AutoSave;
  notify: Notify;
  user?: DiscordUser;
}

export function purgeFilters(): Array<{ id: PurgeFilter; name: string }> {
  return [
    { id: "All", name: m.common.all() },
    { id: "Humans", name: m.common.humans() },
    { id: "Bots", name: m.common.bots() },
    { id: "Links", name: m.serverTools.filterLinks() },
    { id: "Attachments", name: m.serverTools.filterAttachments() }
  ];
}

export function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
