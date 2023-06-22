import { writable } from "svelte/store";
import type { DiscordGuild } from "../types/discordGuild";

export const userAdminGuilds = writable<DiscordGuild[]>([]);
