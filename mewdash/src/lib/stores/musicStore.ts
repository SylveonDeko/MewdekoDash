// stores/musicStore.ts
import { get, writable } from "svelte/store";
import { api } from "$lib/api";
import { currentGuild } from "$lib/stores/currentGuild";
import { logger } from "$lib/logger";
import { musicPlayerColors } from "$lib/stores/musicPlayerColorStore";
import { currentInstance } from "$lib/stores/instanceStore.ts";
import { browser } from "$app/environment";
import { useWebSocket } from "$lib/hooks/useWebSocket";

interface MusicStoreState {
  status: any | null;
  lastTrackId: string | null; // Track the current track ID to detect changes
  connectionStatus: "disconnected" | "connecting" | "connected" | "error";
  error: string | null;
  userId: string | null;
}

function createMusicStore() {
  // Configuration
  const RECONNECT_DELAY = 5000;
  const FALLBACK_POLL_INTERVAL = 3000;

  // Store state
  const { subscribe, set, update } = writable<MusicStoreState>({
    status: null,
    lastTrackId: null,
    connectionStatus: "disconnected",
    error: null,
    userId: null
  });

  // WebSocket connection
  let wsConnection: ReturnType<typeof useWebSocket> | null = null;
  let fallbackPollInterval: NodeJS.Timeout | null = null;
  let reconnectTimeout: NodeJS.Timeout | null = null;

  // Track if we're using fallback polling
  let usingFallback = false;

  function startWebSocketConnection(userId: string) {
    stopConnection(); // Clean up any existing connection

    const guildId = get(currentGuild)?.id;
    const instance = get(currentInstance);

    if (!guildId || !instance?.port || !userId || !browser) {
      logger.error("Missing required parameters for WebSocket connection", { guildId, userId, instance });
      return;
    }

    // Update state
    update(state => ({
      ...state,
      connectionStatus: "connecting",
      userId
    }));

    try {
      // Create proxy WebSocket URL (through our SvelteKit server)
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/ws-proxy?guildId=${guildId}&userId=${userId}&port=${instance.port}`;

      logger.debug("Connecting to WebSocket proxy:", wsUrl);

      // Create WebSocket connection
      wsConnection = useWebSocket(wsUrl);

      // Subscribe to WebSocket status
      const statusUnsubscribe = wsConnection.status.subscribe(status => {
        if (status === "open") {
          logger.debug("WebSocket connected");
          update(state => ({ ...state, connectionStatus: "connected", error: null }));

          // If we were using fallback, stop it
          if (usingFallback) {
            stopFallbackPolling();
            usingFallback = false;
          }
        } else if (status === "error") {
          logger.error("WebSocket connection error");
          update(state => ({ ...state, connectionStatus: "error", error: "WebSocket connection error" }));

          // Start fallback polling if not already using it
          if (!usingFallback) {
            startFallbackPolling(userId);
            usingFallback = true;
          }
        } else if (status === "closed") {
          logger.debug("WebSocket connection closed");
          update(state => ({ ...state, connectionStatus: "disconnected" }));

          // Schedule reconnect
          scheduleReconnect(userId);

          // Start fallback polling if not already using it
          if (!usingFallback) {
            startFallbackPolling(userId);
            usingFallback = true;
          }
        }
      });

      // Subscribe to WebSocket data
      const dataUnsubscribe = wsConnection.data.subscribe(data => {
        if (!data) return;

        try {
          // Get current state for track change detection
          const state = get({ subscribe });
          const newTrackId = data?.CurrentTrack?.Index;
          const prevTrackId = state.lastTrackId;

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
            logger.debug(`Track changed: ${prevTrackId} → ${newTrackId}`);
            musicPlayerColors.updateFromArtwork(data.CurrentTrack.Track.ArtworkUri);
          }
        } catch (err) {
          logger.error("Error processing WebSocket data:", err);
        }
      });

      // Handle cleanup
      return () => {
        statusUnsubscribe();
        dataUnsubscribe();
        if (wsConnection) {
          wsConnection.disconnect();
          wsConnection = null;
        }
      };
    } catch (err) {
      logger.error("Failed to establish WebSocket connection:", err);
      update(state => ({
        ...state,
        connectionStatus: "error",
        error: err instanceof Error ? err.message : "Failed to connect"
      }));

      // Start fallback polling
      startFallbackPolling(userId);
      usingFallback = true;
    }
  }

  // Fallback polling mechanism in case WebSocket fails
  async function fallbackPoll(userId: string) {
    try {
      const guildId = get(currentGuild)?.id;
      if (!guildId) {
        logger.error("Missing guildId for fallback polling");
        return;
      }

      const status = await api.getPlayerStatus(guildId, userId);

      // Get current state for track change detection
      const state = get({ subscribe });
      const newTrackId = status?.CurrentTrack?.Index;
      const prevTrackId = state.lastTrackId;

      // Check if track has changed
      const trackChanged = newTrackId && newTrackId !== prevTrackId;

      // Update the store
      update(state => ({
        ...state,
        status,
        lastTrackId: newTrackId || state.lastTrackId
      }));

      // If track has changed, update the artwork colors
      if (trackChanged && status?.CurrentTrack?.Track?.ArtworkUri) {
        logger.debug(`Track changed (fallback): ${prevTrackId} → ${newTrackId}`);
        await musicPlayerColors.updateFromArtwork(status.CurrentTrack.Track.ArtworkUri);
      }
    } catch (err) {
      logger.error("Fallback polling failed:", err);
    }
  }

  function startFallbackPolling(userId: string) {
    if (fallbackPollInterval) {
      clearInterval(fallbackPollInterval);
    }

    logger.debug("Starting fallback polling");

    // Initial poll
    fallbackPoll(userId);

    // Set up interval
    fallbackPollInterval = setInterval(() => fallbackPoll(userId), FALLBACK_POLL_INTERVAL);
  }

  function stopFallbackPolling() {
    if (fallbackPollInterval) {
      clearInterval(fallbackPollInterval);
      fallbackPollInterval = null;
    }
  }

  function scheduleReconnect(userId: string) {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }

    reconnectTimeout = setTimeout(() => {
      reconnectTimeout = null;
      startWebSocketConnection(userId);
    }, RECONNECT_DELAY) as unknown as NodeJS.Timeout;
  }

  function stopConnection() {
    // Clean up WebSocket
    if (wsConnection) {
      wsConnection.disconnect();
      wsConnection = null;
    }

    // Clean up fallback polling
    stopFallbackPolling();

    // Clean up reconnection timer
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }

    // Reset fallback flag
    usingFallback = false;

    update(state => ({ ...state, connectionStatus: "disconnected" }));
  }

  function startPolling(userId: string) {
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
      userId
    }));

    // Start WebSocket connection (which will fall back to polling if needed)
    startWebSocketConnection(userId);
  }

  function stopPolling() {
    stopConnection();
  }

  function reset() {
    logger.debug("Resetting music store");
    stopConnection();
    set({
      status: null,
      lastTrackId: null,
      connectionStatus: "disconnected",
      error: null,
      userId: null
    });
  }

  function getDebugInfo() {
    const state = get({ subscribe });
    return {
      state,
      usingFallback,
      wsStatus: wsConnection ? get(wsConnection.status) : null,
      guildId: get(currentGuild)?.id,
      instancePort: get(currentInstance)?.port
    };
  }

  return {
    subscribe,
    startPolling,
    stopPolling,
    reset,
    getDebugInfo
  };
}

export const musicStore = createMusicStore();