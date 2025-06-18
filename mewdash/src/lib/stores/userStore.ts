// lib/stores/userStore.ts
import { persisted } from "svelte-persisted-store";
import type { DiscordUser } from "$lib/types/discord";

export const userStore = persisted<DiscordUser | null>("currentUser", null);