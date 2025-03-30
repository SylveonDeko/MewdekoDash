// src/routes/api/music/proxy/+server.ts
import { json } from "@sveltejs/kit";
import { WebSocket } from "ws";


export async function POST({ request }) {
  try {
    const { guildId, userId, instancePort } = await request.json();

    if (!guildId || !userId || !instancePort) {
      return json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Establish a server-side WebSocket connection to the specified instance
    const wsUrl = `ws://localhost:${instancePort}/botapi/music/${guildId}/events?userId=${userId}`;

    // Create an EventSource response
    const stream = new ReadableStream({
      start(controller) {
        const ws = new WebSocket(wsUrl);

        ws.on("open", () => {
          controller.enqueue(`data: ${JSON.stringify({ type: "connected" })}\n\n`);
        });

        ws.on("message", (data) => {
          try {
            // Parse the incoming message and send it to the client
            const parsed = JSON.parse(data.toString());
            controller.enqueue(`data: ${JSON.stringify(parsed)}\n\n`);
          } catch (error) {
            controller.enqueue(`data: ${JSON.stringify({ type: "error", message: "Invalid message format" })}\n\n`);
          }
        });

        ws.on("error", (error) => {
          controller.enqueue(`data: ${JSON.stringify({ type: "error", message: error.message })}\n\n`);
          controller.close();
        });

        ws.on("close", () => {
          controller.enqueue(`data: ${JSON.stringify({ type: "disconnected" })}\n\n`);
          controller.close();
        });

        // Handle client disconnect
        request.signal.addEventListener("abort", () => {
          ws.close();
        });
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });
  } catch (error) {
    console.error("Error in music proxy:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}