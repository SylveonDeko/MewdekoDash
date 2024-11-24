// lib/stores/currentUserStore.ts
import { writable } from "svelte/store";
import type { DiscordUser } from "$lib/types/discord.ts";

export const currentUser = writable<DiscordUser>();
