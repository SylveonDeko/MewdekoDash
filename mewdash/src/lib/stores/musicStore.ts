// stores/musicStore.ts
import { get, writable } from "svelte/store";
import { api } from "$lib/api";
import { currentGuild } from "$lib/stores/currentGuild";
import { logger } from "$lib/logger";

interface MusicStoreState {
  status: any | null;
  failedFetchCount: number;
  isPolling: boolean;
  error: string | null;
}

function createMusicStore() {
  const BASE_DELAY = 3000;
  const MAX_DELAY = 60000;
  const MAX_RETRIES = 10;
  let pollInterval: NodeJS.Timeout | null = null;
  let currentUserId: string | null = null;

  const { subscribe, set, update } = writable<MusicStoreState>({
    status: null,
    failedFetchCount: 0,
    isPolling: false,
    error: null
  });

  async function fetchStatus(userId: string) {
    const state = get({ subscribe });
    if (state.failedFetchCount >= MAX_RETRIES) {
      stopPolling();
      return;
    }

    try {
      const guildId = get(currentGuild)?.id;
      if (!guildId || !userId) return;

      const status = await api.getPlayerStatus(guildId, userId);

      update(state => ({
        ...state,
        status,
        failedFetchCount: 0,
        error: null
      }));

      // Reset to base delay on success
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = setInterval(() => fetchStatus(userId), BASE_DELAY);
      }

    } catch (err) {
      logger.debug("Failed to fetch music status:", err);

      update(state => {
        const newCount = state.failedFetchCount + 1;
        const delay = Math.min(BASE_DELAY * Math.pow(2, newCount - 1), MAX_DELAY);

        if (newCount >= MAX_RETRIES) {
          stopPolling();
          return {
            ...state,
            failedFetchCount: newCount,
            error: "Max retries exceeded"
          };
        }

        // Update interval with new delay
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = setInterval(() => fetchStatus(userId), delay);
        }

        logger.debug(`Failed fetch count: ${newCount}, next delay: ${delay}ms`);

        return {
          ...state,
          status: null,
          failedFetchCount: newCount,
          error: err.message
        };
      });
    }
  }

  function startPolling(userId: string) {
    if (currentUserId === userId) return; // Already polling for this user

    stopPolling(); // Clear any existing polling
    currentUserId = userId;

    update(state => ({ ...state, isPolling: true, failedFetchCount: 0, error: null }));
    fetchStatus(userId); // Initial fetch
    pollInterval = setInterval(() => fetchStatus(userId), BASE_DELAY);
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    currentUserId = null;
    update(state => ({ ...state, isPolling: false }));
  }

  function reset() {
    stopPolling();
    set({
      status: null,
      failedFetchCount: 0,
      isPolling: false,
      error: null
    });
  }

  return {
    subscribe,
    startPolling,
    stopPolling,
    reset
  };
}

export const musicStore = createMusicStore();