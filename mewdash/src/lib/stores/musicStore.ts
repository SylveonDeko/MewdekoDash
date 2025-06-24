// stores/musicStore.ts
import { get, writable } from "svelte/store";
import { api } from "$lib/api";
import { currentGuild } from "$lib/stores/currentGuild";
import { musicPlayerColors } from "$lib/stores/musicPlayerColorStore";
import { currentInstance } from "$lib/stores/instanceStore.ts";

interface MusicStoreState {
  status: any | null;
  lastTrackId: string | null; // Track the current track ID to detect changes
  failedFetchCount: number;
  isPolling: boolean;
  error: string | null;
  userId: bigint | null;
}

function createMusicStore() {
  //logger.debug("Creating music store instance.");
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
  let activeUserId: bigint | null = null;
  let lastKnownGuildId: string | undefined = undefined;

  const { subscribe, set, update } = writable<MusicStoreState>({
    status: null,
    lastTrackId: null,
    failedFetchCount: 0,
    isPolling: false,
    error: null,
    userId: null
  });

  // Subscribe to guild changes to restart polling/websocket
  currentGuild.subscribe(guild => {
    const state = get({ subscribe });
    //logger.debug(`[Guild Subscription] Fired. Current guild: ${guild?.id}, Last known: ${lastKnownGuildId}, Polling: ${state.isPolling}`);
    // If polling is active and a user is set, check if the guild has actually changed.
    if (state.isPolling && activeUserId && lastKnownGuildId !== undefined && guild?.id !== lastKnownGuildId) {
      //logger.info(`[Guild Subscription] Guild changed from ${lastKnownGuildId} to ${guild?.id}. Restarting connection.`);
      startPolling(activeUserId);
    }
    // Always update the last known guild ID. This handles the initial load case.
    if (lastKnownGuildId === undefined) {
      lastKnownGuildId = guild?.id;
    }
  });


  // WebSocket Connection
  function connectWebSocket(userId: bigint) {
    //logger.debug(`connectWebSocket called for user: ${userId}`);
    if (!useWebSocket) {
      //logger.debug("connectWebSocket skipped: useWebSocket is false.");
      return; // Skip if WebSockets are disabled
    }

    const guildId = get(currentGuild)?.id;
    const instancePort = get(currentInstance)?.port;

    if (!guildId || !userId) {
      //logger.error(`Missing guildId or userId for WebSocket connection. GuildId: ${guildId}, UserId: ${userId}`);
      useWebSocket = false;
      //logger.info("Falling back to polling due to missing IDs.");
      startPolling(userId);
      return;
    }

    if (!instancePort) {
      //logger.error("Missing instance port for WebSocket connection.");
      useWebSocket = false;
      //logger.info("Falling back to polling due to missing instance port.");
      startPolling(userId);
      return;
    }

    try {
      // Close any existing connection
      if (webSocket) {
        //logger.debug("Closing existing WebSocket connection before creating a new one.");
        webSocket.close();
        webSocket = null;
      }

      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsHost = window.location.host; // Will be "mewdeko.tech" in production (if its the main bot)

      const wsUrl = !wsHost.includes("localhost") && !wsHost.includes("127.0.0.1") ? `${wsProtocol}//${wsHost}/ws/instance/${instancePort}/music/${guildId}/events?userId=${userId}` : `${wsProtocol}//127.0.0.1:${instancePort}/botapi/music/${guildId}/events?userId=${userId}`;

      //logger.info(`Connecting to WebSocket: ${wsUrl}`);
      webSocket = new WebSocket(wsUrl);

      webSocket.onopen = () => {
        //logger.info("WebSocket connection established successfully.");
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
          //logger.debug("WebSocket message received", { data });

          // Get current state to check for track changes
          const currentState = get({ subscribe });
          const newTrackId = data?.CurrentTrack?.Index;
          const prevTrackId = currentState.lastTrackId;

          // Check if track has changed
          const trackChanged = newTrackId && newTrackId !== prevTrackId;

          if (trackChanged) {
            //logger.debug(`Track changed from ${prevTrackId} to ${newTrackId}`);
          }

          // Update the store
          update(state => ({
            ...state,
            status: data,
            lastTrackId: newTrackId || state.lastTrackId,
            error: null
          }));

          // If track has changed, update the artwork colors
          if (trackChanged && data?.CurrentTrack?.Track?.ArtworkUri) {
            //logger.debug("Updating artwork colors due to track change.");
            musicPlayerColors.updateFromArtwork(data.CurrentTrack.Track.ArtworkUri);
          }
        } catch (err) {
          //logger.error("Error processing WebSocket message:", err);
        }
      };

      webSocket.onerror = () => {
        //logger.error("WebSocket error:", error);

        // Track connection errors
        update(state => ({
          ...state,
          error: "WebSocket connection error"
        }));

        // If this is our first attempt, try again with polling
        if (useWebSocket) {
          //logger.warn("WebSocket error occurred. Disabling WebSockets and falling back to polling.");
          useWebSocket = false;
          startPolling(userId);
        }
      };

      webSocket.onclose = (event) => {
        //logger.debug(`WebSocket closed: Code=${event.code}, Reason='${event.reason}'`);

        // Check if this was a normal closure (1000) or an error
        if (event.code !== 1000 && useWebSocket) {
          // Schedule reconnection
          //logger.info("WebSocket closed unexpectedly. Scheduling reconnection.");
          scheduleReconnect(userId);
        }
      };
    } catch (err) {
      //logger.error("Failed to establish WebSocket connection:", err);
      useWebSocket = false;
      //logger.info("Falling back to polling due to exception in connectWebSocket.");
      startPolling(userId);
    }
  }

  function scheduleReconnect(userId: bigint) {
    if (reconnectTimeout) {
      //logger.debug("Clearing existing reconnect timeout.");
      clearTimeout(reconnectTimeout);
    }
    //logger.info("Scheduling WebSocket reconnect in 5000ms.");
    reconnectTimeout = setTimeout(() => {
      reconnectTimeout = null;
      //logger.info("Attempting WebSocket reconnect now.");
      connectWebSocket(userId);
    }, 5000) as unknown as NodeJS.Timeout;
  }

  // Fallback polling implementation
  async function fetchStatus(userId: bigint) {
    //logger.debug(`fetchStatus called for user: ${userId}`);
    const state = get({ subscribe });
    if (state.failedFetchCount >= MAX_RETRIES) {
      //logger.error(`Max retries (${MAX_RETRIES}) exceeded, stopping polling.`);
      stopPolling();
      return;
    }

    try {
      const guildId = get(currentGuild)?.id;
      if (!guildId) {
        //logger.error("Missing guildId for polling", { userId });
        return;
      }

      //logger.debug(`Fetching status for guild ${guildId}`);
      const status = await api.getPlayerStatus(guildId, userId);
      //logger.debug("Successfully fetched status.", { status });


      // Get the new track ID
      const newTrackId = status?.CurrentTrack?.Index;

      // Check for track changes
      const trackChanged = newTrackId && newTrackId !== state.lastTrackId;
      if (trackChanged) {
        //logger.debug(`Track changed (polling) from ${state.lastTrackId} to ${newTrackId}`);
      }

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
        //logger.debug("Updating artwork colors due to track change (polling).");
        await musicPlayerColors.updateFromArtwork(status.CurrentTrack.Track.ArtworkUri);
      }

      // Adjust polling frequency based on player state
      const optimalDelay = status?.State === 2 ? BASE_DELAY : PAUSED_DELAY;

      // Only change interval if it's significantly different
      if (Math.abs(currentPollDelay - optimalDelay) > 500) {
        //logger.info(`Adjusting poll delay from ${currentPollDelay} to ${optimalDelay}`);
        currentPollDelay = optimalDelay;

        // Reset interval with new delay
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = setInterval(() => fetchStatus(userId), currentPollDelay);
        }
      }
    } catch (err) {
      //logger.error("Failed to fetch music status:", err);

      update(state => {
        const newCount = state.failedFetchCount + 1;
        // Exponential backoff
        const backoffDelay = Math.min(BASE_DELAY * Math.pow(2, newCount - 1), MAX_DELAY);

        if (newCount >= MAX_RETRIES) {
          //logger.error(`Max retries (${MAX_RETRIES}) reached. Stopping polling.`);
          stopPolling();
          return {
            ...state,
            failedFetchCount: newCount,
            error: "Max retries exceeded"
          };
        }

        // Update interval with backoff delay
        if (pollInterval) {
          //logger.warn(`Fetch failed. Applying backoff. Next poll in ${backoffDelay}ms.`);
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

  function startPolling(userId: bigint) {
    //logger.info(`startPolling called for user: ${userId}`);

    // Defer the execution of polling logic.
    // This solves a race condition where external UI components might call startPolling()
    // before Svelte has processed the update to the currentGuild store.
    // By using setTimeout, we push this logic to the end of the event loop,
    // ensuring we get the most up-to-date guild ID.
    setTimeout(() => {
      const state = get({ subscribe });
      const currentGuildId = get(currentGuild)?.id;

      // Idempotency Check: If we're already polling for the correct user/guild, abort.
      if (state.isPolling && state.userId === userId && lastKnownGuildId === currentGuildId) {
        //logger.debug(`(Deferred) startPolling call is redundant. Already polling for user ${userId} in guild ${currentGuildId}. Aborting.`);
        return;
      }

      //logger.debug("(Deferred) Proceeding with startPolling. Cleaning up any existing connections first.");
      stopPolling();
      activeUserId = userId;
      lastKnownGuildId = currentGuildId;


      if (!userId) {
        //logger.error("(Deferred) Cannot start polling without userId. Aborting.");
        return;
      }

      if (!lastKnownGuildId) {
        //logger.error("(Deferred) Cannot start polling without guildId. Aborting.");
        return;
      }

      //logger.info(`(Deferred) Starting polling for user ${userId} in guild ${lastKnownGuildId}`);
      update(s => ({
        ...s,
        isPolling: true,
        failedFetchCount: 0,
        error: null,
        userId
      }));


      // Try WebSocket connection first
      if (useWebSocket) {
        //logger.debug("(Deferred) Attempting to connect via WebSocket.");
        connectWebSocket(userId);
      } else {
        // Fall back to traditional polling
        //logger.debug("(Deferred) Falling back to traditional HTTP polling.");
        currentPollDelay = BASE_DELAY;
        fetchStatus(userId);
        pollInterval = setInterval(() => fetchStatus(userId), currentPollDelay);
      }
    }, 0);
  }

  function stopPolling() {
    //logger.info("stopPolling called.");
    // Do not reset activeUserId here, as deferred calls might need it.
    // It will be reset by the next successful start polling call.

    // Clean up WebSocket
    if (webSocket) {
      //logger.debug("Cleaning up WebSocket.");
      if (webSocket.readyState === WebSocket.OPEN || webSocket.readyState === WebSocket.CONNECTING) {
        // Remove event listeners to prevent onclose from triggering reconnection logic
        webSocket.onclose = null;
        webSocket.onerror = null;
        webSocket.close(1000, "Client initiated stop");
      }
      webSocket = null;
    }

    // Clean up reconnection timer
    if (reconnectTimeout) {
      //logger.debug("Cleaning up reconnect timeout.");
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }

    // Clean up polling interval
    if (pollInterval) {
      //logger.debug("Cleaning up polling interval.");
      clearInterval(pollInterval);
      pollInterval = null;
    }

    // Only update the polling status if it's currently true
    if (get({ subscribe }).isPolling) {
      update(state => ({ ...state, isPolling: false }));
      //logger.debug("stopPolling finished. isPolling set to false.");
    }
  }

  function reset() {
    //logger.warn("Resetting music store to initial state.");
    stopPolling();
    activeUserId = null;
    lastKnownGuildId = undefined;
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
    //logger.debug("getDebugInfo called.");
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
    reset
  };
}

export const musicStore = createMusicStore();
