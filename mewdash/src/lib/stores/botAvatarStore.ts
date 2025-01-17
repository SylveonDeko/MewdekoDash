// lib/stores/currentGuild.ts
import { writable } from "svelte/store";
import type { BotStatusModel } from "$lib/types/models.ts";

export const currentBotStatus = writable<BotStatusModel>();
