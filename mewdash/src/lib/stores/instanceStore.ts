import { writable } from "svelte/store";
import type { BotInstance } from "$lib/types/models";

function createInstanceStore(): {
  subscribe: (this: void, run: (value: BotInstance | null) => void) => () => void;
  set: (this: void, value: BotInstance | null) => void;
  reset: () => void;
  update: (this: void, updater: (value: BotInstance | null) => BotInstance | null) => void;
} {
    const { subscribe, set, update } = writable<BotInstance | null>(null);

    return {
        subscribe,
        set,
        reset: () => set(null),
        update
    };
}

export const currentInstance = createInstanceStore();