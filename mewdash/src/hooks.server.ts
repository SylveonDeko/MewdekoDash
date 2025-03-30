import { authenticateUser } from "$lib/server/discordApi";
import type { Handle } from "@sveltejs/kit";
import { logger } from "$lib/logger";
import { WebSocket, WebSocketServer } from "ws";

// Store active connections
const connections = new Map();
const localConnections = new Map();

// Create a WebSocket server
const wss = new WebSocketServer({ noServer: true });

export const handle: Handle = async ({ event, resolve }) => {
  try {
    logger.debug('Current path:', event.url.pathname);

    // Check if this is a WebSocket upgrade request for our proxy
    if (event.url.pathname === "/api/ws-proxy" &&
      event.request.headers.get("upgrade")?.toLowerCase() === "websocket") {

      // Extract parameters from the query string
      const url = new URL(event.request.url);
      const guildId = url.searchParams.get("guildId");
      const userId = url.searchParams.get("userId");
      const instancePort = url.searchParams.get("port");

      if (!guildId || !userId || !instancePort) {
        return new Response("Missing required parameters", { status: 400 });
      }

      // Set up a WebSocket server and connection
      const { socket: clientSocket, response: upgradeResponse } =
        // @ts-ignore - Works for SvelteKit but TypeScript might complain
        await event.platform?.env?.DENO?.upgradeWebSocket(event.request);

      // Create a unique ID for this connection
      const connectionId = `${guildId}-${userId}-${Date.now()}`;

      // Add message buffering to handle incomplete JSON
      let messageBuffer = "";

      // Set up client connection handlers
      clientSocket.addEventListener("open", () => {
        logger.debug(`Client connected: ${connectionId}`);
        connections.set(connectionId, clientSocket);

        try {
          // Connect to local WebSocket server
          const localWsUrl = `ws://localhost:${instancePort}/botapi/music/${guildId}/events?userId=${userId}`;
          logger.debug(`Connecting to local WebSocket: ${localWsUrl}`);

          const localWs = new WebSocket(localWsUrl);
          localConnections.set(connectionId, localWs);

          localWs.on("open", () => {
            logger.debug(`Connected to local WebSocket: ${connectionId}`);

            if (clientSocket.readyState === WebSocket.OPEN) {
              clientSocket.send(JSON.stringify({ type: "connected" }));
            }
          });

          localWs.on("message", (data) => {
            // Add to buffer and try to parse
            messageBuffer += data.toString();

            try {
              // Try to parse as JSON to validate completeness
              const parsedData = JSON.parse(messageBuffer);

              // If successful, forward to client and reset buffer
              if (clientSocket.readyState === WebSocket.OPEN) {
                clientSocket.send(JSON.stringify(parsedData));
              }

              // Clear buffer after successful parse
              messageBuffer = "";
            } catch (err) {
              // JSON parsing failed, likely an incomplete message
              // Keep in buffer and wait for more data
              logger.debug("Incomplete JSON message, waiting for more data");

              // Safety check: if buffer gets huge, reset it
              if (messageBuffer.length > 100000) {
                logger.error("Buffer overflow, clearing");
                messageBuffer = "";

                if (clientSocket.readyState === WebSocket.OPEN) {
                  clientSocket.send(JSON.stringify({
                    type: "error",
                    message: "Message too large, buffer reset"
                  }));
                }
              }
            }
          });

          localWs.on("error", (error) => {
            logger.error(`Local WebSocket error (${connectionId}):`, error);

            if (clientSocket.readyState === WebSocket.OPEN) {
              clientSocket.send(JSON.stringify({
                type: "error",
                message: "Error communicating with music service"
              }));
            }
          });

          localWs.on("close", () => {
            logger.debug(`Local WebSocket closed (${connectionId})`);

            if (clientSocket.readyState === WebSocket.OPEN) {
              clientSocket.send(JSON.stringify({ type: "disconnected" }));
            }
          });
        } catch (error) {
          logger.error(`Failed to connect to local WebSocket (${connectionId}):`, error);

          if (clientSocket.readyState === WebSocket.OPEN) {
            clientSocket.send(JSON.stringify({
              type: "error",
              message: "Failed to connect to music service"
            }));
          }
        }
      });

      clientSocket.addEventListener("message", (event) => {
        try {
          // Handle client messages (if any)
          const message = JSON.parse(event.data);

          // If it's a ping, just respond with a pong
          if (message.type === "ping") {
            clientSocket.send(JSON.stringify({ type: "pong" }));
            return;
          }

          // Forward any other messages to local WebSocket (if needed)
          const localWs = localConnections.get(connectionId);
          if (localWs && localWs.readyState === WebSocket.OPEN) {
            localWs.send(event.data);
          }
        } catch (err) {
          logger.error("Error processing client message:", err);
        }
      });

      clientSocket.addEventListener("close", () => {
        logger.debug(`Client disconnected: ${connectionId}`);

        // Close local WebSocket connection
        const localWs = localConnections.get(connectionId);
        if (localWs) {
          localWs.close();
          localConnections.delete(connectionId);
        }

        connections.delete(connectionId);

        // Clear any buffered data
        messageBuffer = "";
      });

      clientSocket.addEventListener("error", (error) => {
        logger.error(`Client WebSocket error (${connectionId}):`, error);
      });

      return upgradeResponse;
    }

    // Continue with the normal auth flow for non-WebSocket requests
    const user = await authenticateUser(event, event.cookies);
    logger.debug('Auth state:', !!user);
    event.locals.user = user;

    const response = await resolve(event);

    // Ensure auth headers aren't cached
    if (response.headers) {
      response.headers.set('Cache-Control', 'no-store');
    }

    return response;
  } catch (error) {
    logger.error('Auth error in hook:', error);
    event.locals.user = null;
    return resolve(event);
  }
};