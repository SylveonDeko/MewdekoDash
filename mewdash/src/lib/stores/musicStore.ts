// stores/musicStore.ts
import { get, writable } from "svelte/store";
import { api } from "$lib/api";
import { currentGuild } from "$lib/stores/currentGuild";
import { logger } from "$lib/logger";
import { musicPlayerColors } from "$lib/stores/musicPlayerColorStore";
import { currentInstance } from "$lib/stores/instanceStore.ts";

interface MusicStoreState {
  status: any | null;
  lastTrackId: string | null; // Track the current track ID to detect changes
  failedFetchCount: number;
  isPolling: boolean;
  error: string | null;
  userId: string | null;
}

function createMusicStore() {
  // Configuration
  const BASE_DELAY = 3000;
  const PAUSED_DELAY = 5000;
  const MAX_DELAY = 60000;
  const MAX_RETRIES = 10;

  let pollInterval: NodeJS.Timeout | null = null;
  let currentPollDelay = BASE_DELAY;
  let webSocket: WebSocket | null = null;
  let reconnectTimeout: NodeJS.Timeout | null = null;
  let useWebSocket = true; // Try WebSocket first, fallback to polling

  const { subscribe, set, update } = writable<MusicStoreState>({
    status: null,
    lastTrackId: null,
    failedFetchCount: 0,
    isPolling: false,
    error: null,
    userId: null
  });

  // WebSocket Connection
  function connectWebSocket(userId: string) {
    if (!useWebSocket) return; // Skip if WebSockets are disabled

    const guildId = get(currentGuild)?.id;
    if (!guildId || !userId) {
      logger.error("Missing guildId or userId for WebSocket connection", { guildId, userId });
      useWebSocket = false;
      startPolling(userId);
      return;
    }

    try {
      // Close any existing connection
      if (webSocket) {
        webSocket.close();
        webSocket = null;
      }

      // Create WebSocket URL with guild and user IDs
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//localhost:${get(currentInstance)?.port}/botapi/music/${guildId}/events?userId=${userId}`;

      //logger.debug(`Connecting to WebSocket: ${wsUrl}`);
      webSocket = new WebSocket(wsUrl);

      webSocket.onopen = () => {
        //logger.debug('WebSocket connection established');

        // Reset failure counter on successful connection
        update(state => ({
          ...state,
          isPolling: true,
          failedFetchCount: 0,
          error: null
        }));
      };

      webSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          //logger.debug('WebSocket message received', { data });

          // Get current state to check for track changes
          const currentState = get({ subscribe });
          const newTrackId = data?.CurrentTrack?.Index;
          const prevTrackId = currentState.lastTrackId;

          // Check if track has changed
          const trackChanged = newTrackId && newTrackId !== prevTrackId;

          // Update the store
          update(state => ({
            ...state,
            status: data,
            lastTrackId: newTrackId || state.lastTrackId,
            error: null
          }));

          // If track has changed, update the artwork colors
          if (trackChanged && data?.CurrentTrack?.Track?.ArtworkUri) {
            //logger.debug(`Track changed: ${prevTrackId} → ${newTrackId}`);
            musicPlayerColors.updateFromArtwork(data.CurrentTrack.Track.ArtworkUri);
          }
        } catch (err) {
          logger.error("Error processing WebSocket message:", err);
        }
      };

      webSocket.onerror = (error) => {
        logger.error("WebSocket error:", error);

        // Track connection errors
        update(state => ({
          ...state,
          error: "WebSocket connection error"
        }));

        // If this is our first attempt, try again with polling
        if (useWebSocket) {
          useWebSocket = false;
          startPolling(userId);
        }
      };

      webSocket.onclose = (event) => {
        //logger.debug(`WebSocket closed: ${event.code} ${event.reason}`);

        // Check if this was a normal closure (1000) or an error
        if (event.code !== 1000 && useWebSocket) {
          // Schedule reconnection
          scheduleReconnect(userId);
        }
      };
    } catch (err) {
      logger.error("Failed to establish WebSocket connection:", err);
      useWebSocket = false;
      startPolling(userId);
    }
  }

  function scheduleReconnect(userId: string) {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }

    reconnectTimeout = setTimeout(() => {
      reconnectTimeout = null;
      connectWebSocket(userId);
    }, 5000) as unknown as NodeJS.Timeout;
  }

  // Fallback polling implementation
  async function fetchStatus(userId: string) {
    const state = get({ subscribe });
    if (state.failedFetchCount >= MAX_RETRIES) {
      logger.error(`Max retries (${MAX_RETRIES}) exceeded, stopping polling`);
      stopPolling();
      return;
    }

    try {
      const guildId = get(currentGuild)?.id;
      if (!guildId) {
        logger.error("Missing guildId for polling", { userId });
        return;
      }

      const status = await api.getPlayerStatus(guildId, userId);

      // Get the new track ID
      const newTrackId = status?.CurrentTrack?.Index;

      // Check for track changes
      const trackChanged = newTrackId && newTrackId !== state.lastTrackId;

      // Update store
      update(state => ({
        ...state,
        status,
        lastTrackId: newTrackId || state.lastTrackId,
        failedFetchCount: 0,
        error: null
      }));

      // If track has changed, update the artwork colors
      if (trackChanged && status?.CurrentTrack?.Track?.ArtworkUri) {
        //logger.debug(`Track changed: ${state.lastTrackId} → ${newTrackId}`);
        await musicPlayerColors.updateFromArtwork(status.CurrentTrack.Track.ArtworkUri);
      }

      // Adjust polling frequency based on player state
      const optimalDelay = status?.State === 2 ? BASE_DELAY : PAUSED_DELAY;

      // Only change interval if it's significantly different
      if (Math.abs(currentPollDelay - optimalDelay) > 500) {
        currentPollDelay = optimalDelay;

        // Reset interval with new delay
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = setInterval(() => fetchStatus(userId), currentPollDelay);
        }
      }
    } catch (err) {
      logger.error("Failed to fetch music status:", err);

      update(state => {
        const newCount = state.failedFetchCount + 1;
        // Exponential backoff
        const backoffDelay = Math.min(BASE_DELAY * Math.pow(2, newCount - 1), MAX_DELAY);

        if (newCount >= MAX_RETRIES) {
          stopPolling();
          return {
            ...state,
            failedFetchCount: newCount,
            error: "Max retries exceeded"
          };
        }

        // Update interval with backoff delay
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = setInterval(() => fetchStatus(userId), backoffDelay);
          currentPollDelay = backoffDelay;
        }

        //logger.debug(`Failed fetch count: ${newCount}, next delay: ${backoffDelay}ms`);

        return {
          ...state,
          failedFetchCount: newCount,
          error: err instanceof Error ? err.message : "Failed to fetch music status"
        };
      });
    }
  }

  function startPolling(userId: string) {
    // Clean up any existing connections
    stopPolling();

    if (!userId) {
      logger.error("Cannot start polling without userId");
      return;
    }

    const guildId = get(currentGuild)?.id;
    if (!guildId) {
      logger.error("Cannot start polling without guildId");
      return;
    }


    update(state => ({
      ...state,
      isPolling: true,
      failedFetchCount: 0,
      error: null,
      userId
    }));


    // Try WebSocket connection first
    if (useWebSocket) {
      connectWebSocket(userId);
    } else {
      // Fall back to traditional polling
      currentPollDelay = BASE_DELAY;
      fetchStatus(userId);
      pollInterval = setInterval(() => fetchStatus(userId), currentPollDelay);
    }
  }

  function stopPolling() {
    //logger.debug("Stopping music polling");

    // Clean up WebSocket
    if (webSocket) {
      if (webSocket.readyState === WebSocket.OPEN) {
        webSocket.close(1000, "User disconnected");
      }
      webSocket = null;
    }

    // Clean up reconnection timer
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }

    // Clean up polling interval
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }

    update(state => ({ ...state, isPolling: false }));
  }

  function reset() {
    //logger.debug("Resetting music store");
    stopPolling();
    useWebSocket = true; // Reset WebSocket preference
    set({
      status: null,
      lastTrackId: null,
      failedFetchCount: 0,
      isPolling: false,
      error: null,
      userId: null
    });
  }

  function getDebugInfo() {
    const state = get({ subscribe });
    return {
      state,
      isPolling: !!pollInterval || (webSocket && webSocket.readyState === WebSocket.OPEN),
      webSocketState: webSocket ? webSocket.readyState : "none",
      currentDelay: currentPollDelay,
      guildId: get(currentGuild)?.id
    };
  }

  return {
    subscribe,
    startPolling,
    stopPolling,
    reset,
    getDebugInfo,
    // For testing
    forcePolling: () => {
      useWebSocket = false;
      const userId = get({ subscribe }).userId;
      if (userId) startPolling(userId);
    }
  };
}

export const musicStore = createMusicStore();