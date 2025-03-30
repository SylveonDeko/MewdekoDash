// src/lib/hooks/useWebSocket.ts
import { onDestroy } from "svelte";
import { writable } from "svelte/store";
import { browser } from "$app/environment";

export function useWebSocket(url: string) {
  // Create stores for WebSocket state
  const data = writable<any>(null);
  const status = writable<"connecting" | "open" | "closed" | "error">("closed");
  const error = writable<Error | null>(null);
  const socket = writable<WebSocket | null>(null);

  let ws: WebSocket | null = null;
  let reconnectTimeout: NodeJS.Timeout | null = null;
  let pingInterval: NodeJS.Timeout | null = null;

  // Buffer to handle incomplete JSON messages
  let messageBuffer = "";

  function connect() {
    if (!browser) return; // No WebSockets on server

    // Clear any pending reconnect
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }

    try {
      // Close existing connection if any
      if (ws) {
        ws.close();
        ws = null;
      }

      status.set("connecting");

      // Create new WebSocket connection
      ws = new WebSocket(url);
      socket.set(ws);

      ws.onopen = () => {
        status.set("open");
        error.set(null);

        // Start ping interval to keep connection alive
        if (pingInterval) clearInterval(pingInterval);
        pingInterval = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            // Send a ping message - handled by the server
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 30000) as unknown as NodeJS.Timeout;
      };

      ws.onmessage = (event) => {
        try {
          // For text messages, try to parse as JSON
          if (typeof event.data === "string") {
            // Add the new data to our buffer
            messageBuffer += event.data;

            try {
              // Try to parse the complete buffer
              const parsed = JSON.parse(messageBuffer);

              // If successful, update the data store and clear the buffer
              data.set(parsed);
              messageBuffer = "";
            } catch (e) {
              // If we get a JSON parse error, it might be an incomplete message
              // Just wait for more data
              console.log("Incomplete JSON message, waiting for more data");

              // Safeguard: if buffer gets too large, clear it
              if (messageBuffer.length > 100000) {
                console.error("WebSocket message buffer overflow, clearing");
                messageBuffer = "";
              }
            }
          } else {
            console.warn("Received non-text message from WebSocket");
          }
        } catch (err) {
          console.error("Error processing WebSocket message:", err);
        }
      };

      ws.onclose = (event) => {
        status.set("closed");

        // Schedule reconnect unless it was a normal closure
        if (event.code !== 1000) {
          reconnectTimeout = setTimeout(() => {
            connect();
          }, 5000) as unknown as NodeJS.Timeout;
        }
      };

      ws.onerror = (event) => {
        status.set("error");
        error.set(new Error("WebSocket connection error"));

        // We'll let the onclose handler schedule the reconnect
      };
    } catch (err) {
      status.set("error");
      error.set(err instanceof Error ? err : new Error("Failed to connect WebSocket"));

      // Schedule reconnect
      reconnectTimeout = setTimeout(() => {
        connect();
      }, 5000) as unknown as NodeJS.Timeout;
    }
  }

  function disconnect() {
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }

    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }

    if (ws) {
      try {
        ws.close(1000, "Disconnect requested");
      } catch (err) {
        console.error("Error closing WebSocket:", err);
      }
      ws = null;
      socket.set(null);
    }

    status.set("closed");
  }

  // Clean up on component destroy
  onDestroy(() => {
    disconnect();
  });

  // Connect immediately when called
  if (browser && url) {
    connect();
  }

  return {
    data,
    status,
    error,
    socket,
    connect,
    disconnect
  };
}