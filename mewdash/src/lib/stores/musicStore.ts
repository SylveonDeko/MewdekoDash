// stores/musicStore.ts
import { get, writable } from "svelte/store";
import { musicApi } from "$lib/api/index.ts";
import { currentGuild } from "$lib/stores/currentGuild";
import { musicPlayerColors } from "$lib/stores/musicPlayerColorStore";
import { currentInstance } from "$lib/stores/instanceStore.ts";
import { sseManager } from "$lib/stores/sseManager";

interface MusicStoreState {
  status: any | null;
  lastTrackId: number | null; // Track the current track ID to detect changes
  failedFetchCount: number;
  isPolling: boolean;
  error: string | null;
  userId: bigint | null;
  playerExists: boolean; // Track if player exists
}

function createMusicStore() {
  //logger.info("Creating music store instance.");
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
  let lastKnownGuildId: bigint | undefined = undefined;
  let heartbeatInterval: number | null = null;
  let heartbeatTimeout: number | null = null;
  let lastMessageTime: number = Date.now();
  let wasDestroyedDueToSilence: boolean = false; // Track if player was destroyed due to silence
  let wasExplicitlyDisconnected: boolean = false; // Track if we received explicit disconnection signal
  let sseUnsubscribe: (() => void) | null = null; // SSE unsubscribe function
  const HEARTBEAT_INTERVAL = 1000; // Check every second
  const HEARTBEAT_TIMEOUT = 3000; // Consider dead after 3 seconds of no messages

  const { subscribe, set, update } = writable<MusicStoreState>({
    status: null,
    lastTrackId: null,
    failedFetchCount: 0,
    isPolling: false,
    error: null,
    userId: null,
    playerExists: false
  });

  // Subscribe to guild changes to restart polling/websocket
  currentGuild.subscribe(guild => {
    const state = get({ subscribe });
    //logger.info(`[Guild Subscription] Fired. Current guild: ${guild?.id}, Last known: ${lastKnownGuildId}, Polling: ${state.isPolling}`);
    // If polling is active and a user is set, check if the guild has actually changed.
    if (state.isPolling && activeUserId && lastKnownGuildId !== undefined && guild?.id && guild.id !== lastKnownGuildId) {
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
    //logger.info(`connectWebSocket called for user: ${userId}`);
    if (!useWebSocket) {
      //logger.info("connectWebSocket skipped: useWebSocket is false.");
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
        //logger.info("Closing existing WebSocket connection before creating a new one.");
        webSocket.close();
        webSocket = null;
      }

      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsHost = window.location.host; // Will be "mewdeko.tech" in production (if its the main bot)

      const wsUrl = !wsHost.includes("localhost") && !wsHost.includes("127.0.0.1") ? `${wsProtocol}//${wsHost}/ws/instance/${instancePort}/music/${guildId}/events?userId=${userId}` : `${wsProtocol}//127.0.0.1:${instancePort}/botapi/music/${guildId}/events?userId=${userId}`;

      //logger.info(`Connecting to WebSocket: ${wsUrl}`);
      webSocket = new WebSocket(wsUrl);

      webSocket.onopen = () => {
        update(state => ({
          ...state,
          isPolling: true,
          failedFetchCount: 0,
          error: null
        }));

        // Start heartbeat monitoring
        startHeartbeat();

      };

      webSocket.onmessage = (event) => {
        // Update last message time for heartbeat
        lastMessageTime = Date.now();

        try {
          const data = JSON.parse(event.data);
          //logger.info("WebSocket message received", { data });

          // Log full data once to see structure
          if (!(window as any)._musicDataLogged) {
            (window as any)._musicDataLogged = true;
          }

          // Get current state before any updates
          const currentState = get({ subscribe });

          // Check for explicit disconnection signal from backend
          if (data.Disconnected === true) {

            // Mark as explicitly disconnected
            wasExplicitlyDisconnected = true;

            // Clear the music status and mark player as destroyed
            update(state => ({
              ...state,
              status: null,
              lastTrackId: null,
              playerExists: false,
              error: null
            }));

            // Emit player destroyed event
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('playerDestroyed', {
                bubbles: true
              }));
            }

            // Keep the WebSocket connection alive to detect when bot rejoins
            lastMessageTime = Date.now(); // Reset heartbeat to keep connection alive
            return; // Return here since Disconnected is a special signal with no other data
          }

          // Normal message processing (not a disconnection signal)
          const newTrackId = data?.CurrentTrack?.Index;
          const prevTrackId = currentState.lastTrackId;

          // Check if track has changed
          const trackChanged = newTrackId && newTrackId !== prevTrackId;

          if (trackChanged) {
            //logger.info(`Track changed from ${prevTrackId} to ${newTrackId}`);
          }

          // Determine if player exists based on voice channel status
          const playerExists = data.BotInChannel === true || data.IsInVoiceChannel === true || !!data.CurrentTrack;

          // Check if we're receiving messages after a silence period, disconnection, or explicit disconnection
          if ((wasDestroyedDueToSilence || wasExplicitlyDisconnected || !currentState.playerExists) && playerExists) {
            wasDestroyedDueToSilence = false; // Reset flag
            wasExplicitlyDisconnected = false; // Reset explicit disconnection flag

            // Emit player created event
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('playerCreated', {
                bubbles: true
              }));
            }
          } else if (currentState.playerExists && !playerExists) {
            wasDestroyedDueToSilence = false; // Not due to silence, actual leave
            // Emit player destroyed event
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('playerDestroyed', {
                bubbles: true
              }));
            }
          }

          // Check for explicit disconnection (when bot leaves channel)
          if (!data.BotInChannel && !data.IsInVoiceChannel && !data.CurrentTrack) {
            // Bot is not in channel at all - clear everything
            wasDestroyedDueToSilence = false;
          }

          // Update the store
          update(state => ({
            ...state,
            status: data,
            lastTrackId: newTrackId || state.lastTrackId,
            error: null,
            playerExists: playerExists
          }));

          // If track has changed, update the artwork colors
          if (trackChanged && data?.CurrentTrack?.Track?.ArtworkUri) {
            //logger.info("Updating artwork colors due to track change.");
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

        // Stop heartbeat monitoring
        stopHeartbeat();

        const currentState = get({ subscribe });

        // If we had a player when the connection closed, it means the player was destroyed
        if (currentState.playerExists) {

          // Mark as explicitly disconnected since backend closed the connection
          wasExplicitlyDisconnected = true;

          // Clear the music status and mark player as destroyed
          update(state => ({
            ...state,
            status: null,
            playerExists: false,
            error: null
          }));

          // Emit player destroyed event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('playerDestroyed', {
              bubbles: true
            }));
          }
        }

        // Always try to reconnect if we're still in polling mode
        // This allows us to detect when the bot rejoins after the player was destroyed
        const isStillPolling = get({ subscribe }).isPolling;
        if (useWebSocket && isStillPolling && activeUserId) {
          // Schedule reconnection to detect when bot rejoins
          scheduleReconnect(userId);
        } else {
          // We stopped polling entirely
        }
      };
    } catch (err) {
      //logger.error("Failed to establish WebSocket connection:", err);
      useWebSocket = false;
      //logger.info("Falling back to polling due to exception in connectWebSocket.");
      startPolling(userId);
    }
  }

  function startHeartbeat() {
    stopHeartbeat();
    lastMessageTime = Date.now();

    heartbeatInterval = window.setInterval(() => {
      const timeSinceLastMessage = Date.now() - lastMessageTime;

      if (timeSinceLastMessage > HEARTBEAT_TIMEOUT) {
        const currentState = get({ subscribe });

        // If bot is idle (in channel but not playing), don't timeout
        if (currentState.status?.BotInChannel && !currentState.status?.CurrentTrack) {
          // Bot is idle in channel, this is normal - just reset timer
          lastMessageTime = Date.now();
          return;
        }

        // Only timeout if we're expecting updates (i.e., playing music)
        if (currentState.playerExists && currentState.status?.CurrentTrack) {

          // Mark as potentially dead
          wasDestroyedDueToSilence = true;

          // Close the WebSocket to force reconnection
          if (webSocket && webSocket.readyState === WebSocket.OPEN) {
            webSocket.close(1000, "Heartbeat timeout");
          }

          // Schedule reconnect attempt
          setTimeout(() => {
            if (activeUserId && useWebSocket) {
              connectWebSocket(activeUserId);
            }
          }, 2000);
        }
      }
    }, HEARTBEAT_INTERVAL);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
    if (heartbeatTimeout) {
      clearTimeout(heartbeatTimeout);
      heartbeatTimeout = null;
    }
  }

  // SSE connection for Redis events
  function startEventSource(guildId: bigint) {
    // Clean up existing subscription
    stopEventSource();


    // Subscribe to SSE events via the singleton manager
    sseUnsubscribe = sseManager.subscribe(guildId.toString(), (data) => {

      if (data.event === "playerCreated") {
        wasExplicitlyDisconnected = false;

        // Mark player as existing again
        update(state => ({
          ...state,
          playerExists: true
        }));

        // Emit player created event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('playerCreated', {
            bubbles: true
          }));
        }

        // If we don't have an active WebSocket, try to reconnect
        if (!webSocket || webSocket.readyState !== WebSocket.OPEN) {
          if (activeUserId) {
            // Small delay to ensure bot is fully connected
            const userIdForReconnect = activeUserId;
            setTimeout(() => {
              connectWebSocket(userIdForReconnect);
            }, 500);
          }
        }
      } else if (data.event === "playerDestroyed") {

        // Clear the music status and mark player as destroyed
        update(state => ({
          ...state,
          status: null,
          lastTrackId: null,
          playerExists: false,
          error: null
        }));

        // Emit player destroyed event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('playerDestroyed', {
            bubbles: true
          }));
        }

        // Close WebSocket if it's still open
        if (webSocket && webSocket.readyState === WebSocket.OPEN) {
          webSocket.close(1000, "Player destroyed");
        }
      }
    });
  }

  function stopEventSource() {
    if (sseUnsubscribe) {
      sseUnsubscribe();
      sseUnsubscribe = null;
    }
  }

  function scheduleReconnect(userId: bigint) {
    if (reconnectTimeout) {
      //logger.info("Clearing existing reconnect timeout.");
      clearTimeout(reconnectTimeout);
    }

    // Use shorter reconnect time when explicitly disconnected (player destroyed)
    // to quickly detect when bot rejoins
    const reconnectDelay = wasExplicitlyDisconnected ? 2000 : 5000;

    reconnectTimeout = setTimeout(() => {
      reconnectTimeout = null;
      connectWebSocket(userId);
    }, reconnectDelay) as unknown as NodeJS.Timeout;
  }

  // Fallback polling implementation
  async function fetchStatus(userId: bigint) {
    //logger.info(`fetchStatus called for user: ${userId}`);
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

      //logger.info(`Fetching status for guild ${guildId}`);
      const status = await musicApi.getPlayerStatus(guildId, userId);
      //logger.info("Successfully fetched status.", { status });


      // Get the new track ID
      const newTrackId = status?.CurrentTrack?.Index;

      // Check for track changes
      const trackChanged = newTrackId && newTrackId !== state.lastTrackId;
      if (trackChanged) {
        //logger.info(`Track changed (polling) from ${state.lastTrackId} to ${newTrackId}`);
      }

      // Determine if player exists based on voice channel status
      const playerExists = status?.BotInChannel === true || status?.IsInVoiceChannel === true || !!status?.CurrentTrack;

      // Check if player was destroyed
      if (state.playerExists && !playerExists) {
        wasDestroyedDueToSilence = false; // Not due to silence, actual leave
        // Emit player destroyed event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('playerDestroyed', {
            bubbles: true
          }));
        }
      } else if ((!state.playerExists || wasDestroyedDueToSilence || wasExplicitlyDisconnected) && playerExists) {
        wasDestroyedDueToSilence = false; // Reset flag
        wasExplicitlyDisconnected = false; // Reset explicit disconnection flag
        // Emit player created event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('playerCreated', {
            bubbles: true
          }));
        }
      }

      // Update store
      update(state => ({
        ...state,
        status,
        lastTrackId: newTrackId || state.lastTrackId,
        failedFetchCount: 0,
        error: null,
        playerExists: playerExists
      }));

      // If track has changed, update the artwork colors
      if (trackChanged && status?.CurrentTrack?.Track?.ArtworkUri) {
        //logger.info("Updating artwork colors due to track change (polling).");
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

        //logger.info(`Failed fetch count: ${newCount}, next delay: ${backoffDelay}ms`);

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
        //logger.info(`(Deferred) startPolling call is redundant. Already polling for user ${userId} in guild ${currentGuildId}. Aborting.`);
        return;
      }

      //logger.info("(Deferred) Proceeding with startPolling. Cleaning up any existing connections first.");
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
        userId,
        playerExists: false
      }));

      // Reset WebSocket preference to try connecting again
      useWebSocket = true;

      // Start SSE connection for Redis events
      startEventSource(lastKnownGuildId);

      // Try WebSocket connection first
      if (useWebSocket) {
        connectWebSocket(userId);
      } else {
        // Fall back to traditional polling
        //logger.info("(Deferred) Falling back to traditional HTTP polling.");
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

    // Stop heartbeat first
    stopHeartbeat();

    // Stop SSE connection
    stopEventSource();

    // Clean up WebSocket
    if (webSocket) {
      //logger.info("Cleaning up WebSocket.");
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
      //logger.info("Cleaning up reconnect timeout.");
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }

    // Clean up polling interval
    if (pollInterval) {
      //logger.info("Cleaning up polling interval.");
      clearInterval(pollInterval);
      pollInterval = null;
    }

    // Only update the polling status if it's currently true
    if (get({ subscribe }).isPolling) {
      update(state => ({ ...state, isPolling: false, playerExists: false }));
      //logger.info("stopPolling finished. isPolling set to false.");
    }
  }

  function reset() {
    //logger.warn("Resetting music store to initial state.");
    stopPolling();
    stopEventSource(); // Make sure SSE is cleaned up
    activeUserId = null;
    lastKnownGuildId = undefined;
    useWebSocket = true; // Reset WebSocket preference
    lastMessageTime = Date.now(); // Reset heartbeat tracking
    wasDestroyedDueToSilence = false; // Reset silence flag
    wasExplicitlyDisconnected = false; // Reset explicit disconnection flag
    set({
      status: null,
      lastTrackId: null,
      failedFetchCount: 0,
      isPolling: false,
      error: null,
      userId: null,
      playerExists: false
    });
  }

  function getDebugInfo() {
    //logger.info("getDebugInfo called.");
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
