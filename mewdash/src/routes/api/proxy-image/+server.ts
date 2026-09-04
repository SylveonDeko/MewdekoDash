import type { RequestHandler } from "@sveltejs/kit";
import { logger } from "$lib/logger";

/**
 * Largest image we are willing to relay, so the proxy cannot be pointed at a huge
 * file to exhaust memory.
 */
const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Hosts whose images may be relayed. This proxy exists only to fetch cover art for
 * the music player, so the set is small and closed. Without an allow-list the
 * endpoint is a server-side request forgery primitive: it is unauthenticated, it
 * returns the response body verbatim with permissive CORS, and it runs inside the
 * deployment's network, where it can reach loopback services and cloud metadata.
 */
const ALLOWED_HOSTS = [
  "cdn.discordapp.com",
  "media.discordapp.net",
  "i.ytimg.com",
  "img.youtube.com",
  "i.scdn.co",
  "i1.sndcdn.com",
  "i.sndcdn.com",
  "is1-ssl.mzstatic.com",
  "resources.tidal.com",
  "lastfm.freetls.fastly.net",
  "coverartarchive.org",
  "ia903103.us.archive.org"
];

function isAllowed(candidate: string): URL | null {
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:") return null;

  const host = parsed.hostname.toLowerCase();
  const allowed = ALLOWED_HOSTS.some(
    (entry) => host === entry || host.endsWith(`.${entry}`)
  );

  return allowed ? parsed : null;
}

export const GET: RequestHandler = async ({ url }) => {
  const imageUrl = url.searchParams.get("url");

  if (!imageUrl) {
    return new Response("Missing URL parameter", { status: 400 });
  }

  const target = isAllowed(imageUrl);
  if (!target) {
    logger.warn("Blocked image proxy request for disallowed URL");
    return new Response("URL not allowed", { status: 400 });
  }

  try {
    // Redirects are not followed: a permitted host could otherwise bounce the
    // request to an internal address and defeat the allow-list.
    const response = await fetch(target, { redirect: "manual" });

    if (!response.ok) {
      return new Response("Failed to proxy image", { status: 502 });
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      return new Response("Not an image", { status: 400 });
    }

    const declaredLength = Number(response.headers.get("content-length") ?? "0");
    if (declaredLength > MAX_BYTES) {
      return new Response("Image too large", { status: 413 });
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_BYTES) {
      return new Response("Image too large", { status: 413 });
    }

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    logger.error("Image proxy error:", error);
    return new Response("Failed to proxy image", { status: 500 });
  }
};
