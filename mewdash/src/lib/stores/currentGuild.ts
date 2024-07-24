import { writable } from 'svelte/store';
import type {DiscordGuild} from "$lib/types/discordGuild";

export const currentGuild = writable<DiscordGuild | null>(null);