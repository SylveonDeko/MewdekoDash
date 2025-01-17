import { writable } from 'svelte/store';
import type { BotInstance } from '$lib/types/models';

function createInstanceStore() {
    const { subscribe, set, update } = writable<BotInstance | null>(null);

    return {
        subscribe,
        set,
        reset: () => set(null),
        update
    };
}

export const currentInstance = createInstanceStore();