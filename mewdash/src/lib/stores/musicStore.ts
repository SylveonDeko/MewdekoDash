// stores/musicStore.ts
import { get, writable } from "svelte/store";
import { logger } from "$lib/logger";
import { musicApi } from "$lib/api/index.ts";
import { ApiError } from "$lib/api/core";
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
  // Configuration
  const BASE_DELAY = 3000;
  const PAUSED_DELAY = 5000;
  const MAX_DELAY = 60000;
  const MAX_RETRIES = 10;

  let pollInterval: NodeJS.Timeout | null = null;
  let currentPollDelay = BASE_DELAY;
  /** Live status stream (Server-Sent Events through the dashboard); null when polling. */
  let statusStream: EventSource | null = null;
  let reconnectTimeout: NodeJS.Timeout | null = null;
  let useWebSocket = true; // Try the live stream first, fall back to polling
  let activeUserId: bigint | null = null;
  let lastKnownGuildId: bigint | undefined = undefined;
  let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
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

  /**
   * Dispatches a player lifecycle event on the window, when running in a browser.
   */
  function emitPlayerEvent(name: "playerCreated" | "playerDestroyed") {
    if (typeof globalThis.window !== "undefined") {
      globalThis.dispatchEvent(new CustomEvent(name, { bubbles: true }));
    }
  }

  /**
   * Whether a music status payload indicates an active player: the bot is in a
   * voice channel or a current track is present.
   */
  function computePlayerExists(status: any): boolean {
    return (
      status?.BotInChannel === true ||
      status?.IsInVoiceChannel === true ||
      !!status?.CurrentTrack
    );
  }

  // Subscribe to guild changes to restart polling/websocket
  currentGuild.subscribe(guild => {
    const state = get({ subscribe });
    // If polling is active and a user is set, check if the guild has actually changed.
    if (state.isPolling && activeUserId && lastKnownGuildId !== undefined && guild?.id && guild.id !== lastKnownGuildId) {
      startPolling(activeUserId);
    }
    // Always update the last known guild ID. This handles the initial load case.
    if (lastKnownGuildId === undefined) {
      lastKnownGuildId = guild?.id;
    }
  });


  // WebSocket Connection
  /**
   * Switches this session to HTTP polling. Unlike startPolling this bypasses
   * the idempotency check, which is what the old fallback tripped over: the
   * session was already marked as polling by the socket attempt, so the
   * fallback call returned early and nothing ever fetched a status.
   */
  function fallbackToPolling(userId: bigint) {
    useWebSocket = false;
    stopHeartbeat();
    closeStream();
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    if (!userId) return;
    currentPollDelay = BASE_DELAY;
    update(s => ({ ...s, isPolling: true, failedFetchCount: 0, error: null, userId }));
    fetchStatus(userId);
    pollInterval = setInterval(() => fetchStatus(userId), currentPollDelay);
  }

  /** Closes the live status stream without triggering its error handler. */
  function closeStream() {
    if (!statusStream) return;
    statusStream.onerror = null;
    statusStream.onopen = null;
    try { statusStream.close(); } catch { /* already closed */ }
    statusStream = null;
  }

  /**
   * Opens the live status stream. The browser subscribes to the dashboard's
   * /api/music/stream route with EventSource; the dashboard opens the bot's
   * events endpoint server side with the credentials the bot's access filter
   * checks and pipes the frames through. Status is receive only; controls go
   * through the REST proxy.
   */
  function connectStatusStream(userId: bigint) {
    if (!useWebSocket) {
      return; // Live stream disabled for this session, polling is active
    }

    const guildId = get(currentGuild)?.id;
    const instancePort = get(currentInstance)?.port;

    if (!guildId || !userId) {
      fallbackToPolling(userId);
      return;
    }

    try {
      closeStream();

      const params = new URLSearchParams({ guildId: guildId.toString() });
      if (instancePort) params.set("instance", String(instancePort));

      const stream = new EventSource(`/api/music/stream?${params.toString()}`);
      statusStream = stream;
      let opened = false;

      stream.onopen = () => {
        opened = true;
        update(state => ({
          ...state,
          isPolling: true,
          failedFetchCount: 0,
          error: null
        }));
        startHeartbeat();
      };

      stream.addEventListener("status", (event) => {
        lastMessageTime = Date.now();
        handleStatusFrame((event as MessageEvent).data);
      });

      stream.addEventListener("heartbeat", () => {
        lastMessageTime = Date.now();
      });

      stream.onerror = () => {
        if (!opened) {
          // Never connected: not signed in, no instance, or the bot refused. Poll instead.
          logger.warn("Music status stream unavailable, falling back to polling");
          fallbackToPolling(userId);
          return;
        }

        // While CONNECTING the browser is retrying on its own; only act once it gives up.
        if (stream.readyState !== EventSource.CLOSED) return;

        stopHeartbeat();
        const currentState = get({ subscribe });

        // If we had a player when the stream closed, treat it as destroyed
        if (currentState.playerExists) {
          wasExplicitlyDisconnected = true;
          update(state => ({
            ...state,
            status: null,
            playerExists: false,
            error: null
          }));
          emitPlayerEvent("playerDestroyed");
        }

        // Reconnect while this session is still live so a rejoin is picked up
        if (useWebSocket && get({ subscribe }).isPolling && activeUserId) {
          scheduleReconnect(userId);
        }
      };
    } catch (err) {
      logger.warn("Music status stream setup failed, falling back to polling", err);
      fallbackToPolling(userId);
    }
  }

  /** Applies one status frame from the live stream to the store. */
  function handleStatusFrame(raw: string) {
        try {
          const data = JSON.parse(raw);

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

            emitPlayerEvent("playerDestroyed");

            // Keep the stream alive to detect when bot rejoins
            lastMessageTime = Date.now(); // Reset heartbeat to keep connection alive
            return; // Return here since Disconnected is a special signal with no other data
          }

          // Normal message processing (not a disconnection signal)
          const newTrackId = data?.CurrentTrack?.Index;
          const prevTrackId = currentState.lastTrackId;

          // Check if track has changed
          const trackChanged = newTrackId && newTrackId !== prevTrackId;


          // Determine if player exists based on voice channel status
          const playerExists = computePlayerExists(data);

          // Check if we're receiving messages after a silence period, disconnection, or explicit disconnection
          if ((wasDestroyedDueToSilence || wasExplicitlyDisconnected || !currentState.playerExists) && playerExists) {
            wasDestroyedDueToSilence = false; // Reset flag
            wasExplicitlyDisconnected = false; // Reset explicit disconnection flag

            emitPlayerEvent("playerCreated");
          } else if (currentState.playerExists && !playerExists) {
            wasDestroyedDueToSilence = false; // Not due to silence, actual leave
            emitPlayerEvent("playerDestroyed");
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
            musicPlayerColors.updateFromArtwork(data.CurrentTrack.Track.ArtworkUri);
          }
        } catch (err) {
          logger.error("Error processing music status frame", err);
        }
  }

  function startHeartbeat() {
    stopHeartbeat();
    lastMessageTime = Date.now();

    heartbeatInterval = globalThis.setInterval(() => {
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

          // Close the stream to force reconnection
          closeStream();

          // Schedule reconnect attempt
          setTimeout(() => {
            if (activeUserId && useWebSocket) {
              connectStatusStream(activeUserId);
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

        emitPlayerEvent("playerCreated");

        // If we don't have an open stream, try to reconnect
        if (statusStream?.readyState !== EventSource.OPEN) {
          if (activeUserId) {
            // Small delay to ensure bot is fully connected
            const userIdForReconnect = activeUserId;
            setTimeout(() => {
              connectStatusStream(userIdForReconnect);
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

        emitPlayerEvent("playerDestroyed");

        // Close the stream if it's still open
        closeStream();
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
      clearTimeout(reconnectTimeout);
    }

    // Use shorter reconnect time when explicitly disconnected (player destroyed)
    // to quickly detect when bot rejoins
    const reconnectDelay = wasExplicitlyDisconnected ? 2000 : 5000;

    reconnectTimeout = setTimeout(() => {
      reconnectTimeout = null;
      connectStatusStream(userId);
    }, reconnectDelay) as unknown as NodeJS.Timeout;
  }

  // Fallback polling implementation
  async function fetchStatus(userId: bigint) {
    const state = get({ subscribe });
    if (state.failedFetchCount >= MAX_RETRIES) {
      stopPolling();
      return;
    }

    try {
      const guildId = get(currentGuild)?.id;
      if (!guildId) {
        return;
      }

      const status = await musicApi.getPlayerStatus(guildId, userId);


      // Get the new track ID
      const newTrackId = status?.CurrentTrack?.Index;

      // Check for track changes
      const trackChanged = newTrackId && newTrackId !== state.lastTrackId;

      // Determine if player exists based on voice channel status
      const playerExists = computePlayerExists(status);

      // Check if player was destroyed
      if (state.playerExists && !playerExists) {
        wasDestroyedDueToSilence = false; // Not due to silence, actual leave
        emitPlayerEvent("playerDestroyed");
      } else if ((!state.playerExists || wasDestroyedDueToSilence || wasExplicitlyDisconnected) && playerExists) {
        wasDestroyedDueToSilence = false; // Reset flag
        wasExplicitlyDisconnected = false; // Reset explicit disconnection flag
        emitPlayerEvent("playerCreated");
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
      // 404 is the bot's answer when it is not in a voice channel: a valid
      // "no player" state, not a failed request. Record it and keep polling
      // at the idle rate instead of backing off toward giving up.
      if (err instanceof ApiError && err.status === 404) {
        const state = get({ subscribe });
        if (state.playerExists) emitPlayerEvent("playerDestroyed");
        update(s => ({ ...s, status: null, lastTrackId: null, failedFetchCount: 0, error: null, playerExists: false }));
        if (pollInterval && currentPollDelay !== PAUSED_DELAY) {
          currentPollDelay = PAUSED_DELAY;
          clearInterval(pollInterval);
          pollInterval = setInterval(() => fetchStatus(userId), currentPollDelay);
        }
        return;
      }

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

  function startPolling(userId: bigint) {

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
        return;
      }

      stopPolling();
      activeUserId = userId;
      lastKnownGuildId = currentGuildId;


      if (!userId) {
        return;
      }

      if (!lastKnownGuildId) {
        return;
      }

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
        connectStatusStream(userId);
      } else {
        // Fall back to traditional polling
        currentPollDelay = BASE_DELAY;
        fetchStatus(userId);
        pollInterval = setInterval(() => fetchStatus(userId), currentPollDelay);
      }
    }, 0);
  }

  function stopPolling() {
    // Do not reset activeUserId here, as deferred calls might need it.
    // It will be reset by the next successful start polling call.

    // Stop heartbeat first
    stopHeartbeat();

    // Stop SSE connection
    stopEventSource();

    // Clean up the live status stream without triggering its error handler
    closeStream();

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

    // Only update the polling status if it's currently true
    if (get({ subscribe }).isPolling) {
      update(state => ({ ...state, isPolling: false, playerExists: false }));
    }
  }

  function reset() {
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
    const state = get({ subscribe });
    return {
      state,
      isPolling: !!pollInterval || (statusStream !== null && statusStream.readyState === EventSource.OPEN),
      streamState: statusStream ? statusStream.readyState : "none",
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
