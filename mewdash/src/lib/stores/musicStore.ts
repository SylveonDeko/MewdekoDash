// stores/musicStore.ts (modified version)
import { get, writable } from "svelte/store";
import { api } from "$lib/api";
import { currentGuild } from "$lib/stores/currentGuild";
import { logger } from "$lib/logger";
import { musicPlayerColors } from "$lib/stores/musicPlayerColorStore";
import { currentInstance } from "$lib/stores/instanceStore.ts";

interface MusicStoreState {
  status: any | null;
  lastTrackId: string | null;
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
  let eventSource: EventSource | null = null;
  let reconnectTimeout: NodeJS.Timeout | null = null;
  let useSSE = true; // Try Server-Sent Events first, fallback to polling

  const { subscribe, set, update } = writable<MusicStoreState>({
    status: null,
    lastTrackId: null,
    failedFetchCount: 0,
    isPolling: false,
    error: null,
    userId: null
  });

  // Server-Sent Events Connection
  function connectSSE(userId: string) {
    if (!useSSE) return; // Skip if SSE is disabled

    const guildId = get(currentGuild)?.id;
    const instance = get(currentInstance);

    if (!guildId || !userId || !instance) {
      logger.error("Missing guildId, userId or instance for SSE connection", { guildId, userId, instance });
      useSSE = false;
      startPolling(userId);
      return;
    }

    try {
      // Close any existing connection
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }

      // Create event source URL
      const sseUrl = `/api/music/proxy`;

      // Initialize EventSource for SSE
      const fetchController = new AbortController();

      // Post the connection parameters to the server
      fetch(sseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          guildId,
          userId,
          instancePort: instance.port
        }),
        signal: fetchController.signal
      }).then(response => {
        if (!response.ok) {
          throw new Error(`SSE connection failed: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No readable stream available");
        }

        // Process the stream
        const decoder = new TextDecoder();

        function processStream() {
          reader.read().then(({ done, value }) => {
            if (done) {
              logger.debug("SSE stream closed");
              return;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const eventData = JSON.parse(line.substring(6));

                  if (eventData.type === "error") {
                    logger.error("SSE error:", eventData.message);
                    continue;
                  }

                  if (eventData.type === "disconnected") {
                    scheduleReconnect(userId);
                    return;
                  }

                  // Handle normal music status updates
                  handleMusicStatusUpdate(eventData);
                } catch (err) {
                  logger.error("Error parsing SSE data:", err);
                }
              }
            }

            // Continue reading
            processStream();
          }).catch(err => {
            logger.error("Error reading SSE stream:", err);
            useSSE = false;
            startPolling(userId);
          });
        }

        processStream();

        // Update store state
        update(state => ({
          ...state,
          isPolling: true,
          failedFetchCount: 0,
          error: null
        }));
      }).catch(err => {
        logger.error("Failed to establish SSE connection:", err);
        useSSE = false;
        startPolling(userId);
      });

    } catch (err) {
      logger.error("Failed to establish SSE connection:", err);
      useSSE = false;
      startPolling(userId);
    }
  }

  function handleMusicStatusUpdate(data: any) {
    try {
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
      logger.error("Error processing music status update:", err);
    }
  }

  function scheduleReconnect(userId: string) {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }

    reconnectTimeout = setTimeout(() => {
      reconnectTimeout = null;
      connectSSE(userId);
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
      handleMusicStatusUpdate(status);

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

    // Try SSE connection first
    if (useSSE) {
      connectSSE(userId);
    } else {
      // Fall back to traditional polling
      currentPollDelay = BASE_DELAY;
      fetchStatus(userId);
      pollInterval = setInterval(() => fetchStatus(userId), currentPollDelay);
    }
  }

  function stopPolling() {
    // Clean up EventSource
    if (eventSource) {
      eventSource.close();
      eventSource = null;
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
    stopPolling();
    useSSE = true; // Reset SSE preference
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
      isPolling: !!pollInterval || !!eventSource,
      sseState: eventSource ? "connected" : "none",
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
      useSSE = false;
      const userId = get({ subscribe }).userId;
      if (userId) startPolling(userId);
    }
  };
}

export const musicStore = createMusicStore();