import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import { WebSocketServer, WebSocket as NodeWebSocket } from "ws";
import { verifyAccessToken } from "./mobileJwt";
import { defaultInstanceURL, resolveInstanceURL } from "./instances";
import { logger } from "$lib/logger";

const wss = new WebSocketServer({ noServer: true });

const PATH = "/api/mobile/music/ws";

/**
 * Handles a WebSocket upgrade request bound for the mobile music relay.
 * Authenticates the supplied JWT, resolves the target bot instance, opens
 * an upstream WebSocket to the bot's `music/{guildId}/events` endpoint,
 * and pipes frames in both directions.
 *
 * - Parameter request: The incoming HTTP upgrade request.
 * - Parameter socket: The TCP socket the request came in on.
 * - Parameter head: The leading bytes of the upgrade buffer.
 * - Returns: `true` if the request was for this relay (handled or rejected),
 *   `false` if the upgrade should be left for another listener.
 */
export async function handleMobileMusicUpgrade(
  request: IncomingMessage,
  socket: Duplex,
  head: Buffer,
): Promise<boolean> {
  const url = new URL(request.url ?? "", "http://localhost");
  if (url.pathname !== PATH) return false;

  const headerToken = (request.headers.authorization ?? "").replace(/^bearer\s+/i, "");
  const queryToken = url.searchParams.get("access_token") ?? "";
  const claims = verifyAccessToken(headerToken || queryToken);
  if (!claims) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return true;
  }

  const guildId = url.searchParams.get("guildId");
  const userId = url.searchParams.get("userId");
  if (!guildId || !userId) {
    socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
    socket.destroy();
    return true;
  }

  const instanceHeader =
    (request.headers["x-mobile-instance"] as string | undefined) ??
    url.searchParams.get("instance") ??
    undefined;

  let backend: string | null = null;
  try {
    backend = instanceHeader
      ? await resolveInstanceURL(instanceHeader)
      : await defaultInstanceURL();
  } catch (err) {
    logger.error("mobile music ws: instance resolution failed", err);
  }
  if (!backend) {
    socket.write("HTTP/1.1 503 Service Unavailable\r\n\r\n");
    socket.destroy();
    return true;
  }

  const upstreamUrl =
    `${backend}/music/${guildId}/events?userId=${encodeURIComponent(userId)}`.replace(
      /^http/,
      "ws",
    );

  logger.info(`mobile music ws: client authed, opening upstream ${upstreamUrl}`);
  const upstream = new NodeWebSocket(upstreamUrl);

  wss.handleUpgrade(request, socket, head, (client) => {
    let upstreamReady = false;
    const pending: (string | Buffer)[] = [];

    upstream.on("open", () => {
      upstreamReady = true;
      logger.info(`mobile music ws: upstream open (guild ${guildId})`);
      while (pending.length) {
        const frame = pending.shift();
        if (frame !== undefined) upstream.send(frame);
      }
    });
    upstream.on("message", (data, isBinary) => {
      if (client.readyState === client.OPEN) client.send(data, { binary: isBinary });
    });
    upstream.on("close", (code, reason) => {
      logger.info(
        `mobile music ws: upstream closed code=${code} reason=${reason?.toString() || ""}`,
      );
      closeBoth();
    });
    upstream.on("error", (err) => {
      logger.warn(`mobile music ws: upstream error ${err.message}`);
      closeBoth();
    });

    client.on("message", (data, isBinary) => {
      if (upstreamReady) {
        upstream.send(data, { binary: isBinary });
      } else {
        pending.push(data as Buffer);
      }
    });
    client.on("close", (code, reason) => {
      logger.info(
        `mobile music ws: client closed code=${code} reason=${reason?.toString() || ""}`,
      );
      closeBoth();
    });
    client.on("error", (err) => {
      logger.warn(`mobile music ws: client error ${err.message}`);
      closeBoth();
    });

    function closeBoth() {
      try { client.close(); } catch { /* already closed */ }
      try { upstream.close(); } catch { /* already closed */ }
    }
  });

  return true;
}
