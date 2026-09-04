// lib/stores/adminGuildsStore.ts
import { writable } from "svelte/store";
import type { DiscordGuild } from "../types/discordGuild";

export const userAdminGuilds = writable<DiscordGuild[]>([]);

/**
 * Whether userAdminGuilds holds a completed fetch for the current instance. An empty
 * list means "no mutual guilds" only once this is true; before that it just means the
 * fetch has not finished, and callers must not treat a selected guild as invalid.
 */
export const adminGuildsLoaded = writable(false);
