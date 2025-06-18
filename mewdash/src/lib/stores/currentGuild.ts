// lib/stores/currentGuild.ts
import { persisted } from "svelte-persisted-store";
import type { DiscordGuild } from "$lib/types/discordGuild";

export const currentGuild = persisted<DiscordGuild | null>("currentGuild", null);
