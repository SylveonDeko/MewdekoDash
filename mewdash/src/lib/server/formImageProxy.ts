import { createHmac, timingSafeEqual } from "node:crypto";
import dns from "node:dns";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import { env } from "$env/dynamic/private";

/** The path the proxy answers on. */
export const PROXY_PATH = "/api/forms/image";

/** The longest original address that is signed. */
export const MAX_URL_LENGTH = 2048;

/** The most image bytes read from an outside server. */
export const MAX_BYTES = 8 * 1024 * 1024;

const MAX_REDIRECTS = 3;
const OVERALL_TIMEOUT_MS = 10_000;
const CONNECT_TIMEOUT_MS = 5_000;
const KEY_LABEL = "mewdeko-form-image-proxy-v1";

/** Hosts of Discord's own CDN, which pages load directly. */
const DISCORD_CDN_HOSTS = new Set(["cdn.discordapp.com", "media.discordapp.net"]);

let cachedKey: Buffer | null | undefined;

/**
 * The key addresses are signed with. A configured key is used as it is, otherwise one is derived
 * from the backend token secret so it survives restarts and is the same on every replica.
 *
 * @returns The key, or null when neither value is available.
 */
function signingKey(): Buffer | null {
  if (cachedKey !== undefined) return cachedKey;

  const configured = env.FORMS_IMAGE_PROXY_KEY?.trim();
  if (configured) {
    cachedKey = Buffer.from(configured, "utf8");
  } else if (env.BOT_JWT_SECRET && env.BOT_JWT_SECRET.length >= 32) {
    cachedKey = createHmac("sha256", env.BOT_JWT_SECRET).update(KEY_LABEL).digest();
  } else {
    cachedKey = null;
  }

  return cachedKey;
}

/** Whether the proxy has a key and so can sign and answer. */
export function proxyAvailable(): boolean {
  return signingKey() !== null;
}

/**
 * Whether an address may be requested at all: http or https on the default port with no
 * credentials.
 *
 * @param url The address to check.
 * @returns True for an address the proxy will consider.
 */
export function isFetchable(url: URL): boolean {
  return (url.protocol === "http:" || url.protocol === "https:") && url.username === "" && url.password === "" && url.port === "" && url.hostname !== "";
}

/**
 * Whether Discord's own CDN serves an address, so pages load it without the proxy.
 *
 * @param value The address to check.
 * @returns True for an https address on an exact CDN host.
 */
export function isDiscordCdn(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.username === "" && url.password === "" && url.port === "" && DISCORD_CDN_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

/**
 * Builds the proxied address of an outside image.
 *
 * @param original The address as the form owner wrote it.
 * @returns The proxied address, or null when it cannot be signed.
 */
export function signImageUrl(original: string): string | null {
  const key = signingKey();
  if (!key || original.length === 0 || original.length > MAX_URL_LENGTH) return null;

  const bytes = Buffer.from(original, "utf8");
  const signature = createHmac("sha256", key).update(bytes).digest("base64url");

  return `${PROXY_PATH}?u=${bytes.toString("base64url")}&s=${signature}`;
}

/**
 * Checks a proxied address's two parts and recovers the original address.
 *
 * @param encoded The `u` value.
 * @param signature The `s` value.
 * @returns The original address, or null when the signature does not match.
 */
export function verifyImageUrl(encoded: string | null, signature: string | null): string | null {
  const key = signingKey();
  if (!key || !encoded || !signature) return null;
  if (encoded.length > MAX_URL_LENGTH * 2 || signature.length > 64) return null;

  const bytes = Buffer.from(encoded, "base64url");
  const given = Buffer.from(signature, "base64url");
  if (bytes.length === 0 || bytes.length > MAX_URL_LENGTH) return null;

  const expected = createHmac("sha256", key).update(bytes).digest();
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

  return bytes.toString("utf8");
}

const NON_PUBLIC = new net.BlockList();
for (const [network, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4]
] as const) {
  NON_PUBLIC.addSubnet(network, prefix, "ipv4");
}
for (const [network, prefix] of [
  ["2001:db8::", 32],
  ["2001::", 23],
  ["2002::", 16],
  ["3fff::", 20]
] as const) {
  NON_PUBLIC.addSubnet(network, prefix, "ipv6");
}

const GLOBAL_UNICAST_V6 = new net.BlockList();
GLOBAL_UNICAST_V6.addSubnet("2000::", 3, "ipv6");

/**
 * Whether an address belongs to the public internet. Loopback, private, link-local, shared,
 * multicast, documentation, benchmark and reserved ranges are refused, and an IPv4-mapped IPv6
 * address is judged by the IPv4 address inside it.
 *
 * @param address A literal IPv4 or IPv6 address.
 * @returns True when the address is public.
 */
export function isPublicAddress(address: string): boolean {
  const family = net.isIP(address);

  if (family === 4) return !NON_PUBLIC.check(address, "ipv4");
  if (family !== 6) return false;

  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(address);
  if (mapped) return isPublicAddress(mapped[1]);

  return GLOBAL_UNICAST_V6.check(address, "ipv6") && !NON_PUBLIC.check(address, "ipv6");
}

/**
 * Resolves a host and refuses to connect unless every address it resolved is public, then hands
 * back the address it checked, so the connection goes where the check looked.
 */
function safeLookup(
  hostname: string,
  options: dns.LookupOptions,
  callback: (error: NodeJS.ErrnoException | null, address?: string | dns.LookupAddress[], family?: number) => void
): void {
  dns.lookup(hostname, { all: true, family: options.family }, (error, addresses) => {
    if (error) return callback(error);
    if (addresses.length === 0 || !addresses.every((entry) => isPublicAddress(entry.address))) {
      return callback(Object.assign(new Error("The address is not public."), { code: "EACCES" }) as NodeJS.ErrnoException);
    }
    if (options.all) return callback(null, addresses);
    callback(null, addresses[0].address, addresses[0].family);
  });
}

/** An image fetched for a visitor, already checked to be one of the allowed formats. */
export interface FetchedImage {
  content: Buffer;
  contentType: string;
}

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/gif", "image/webp", "image/avif"]);

/**
 * Works out an image's type from its first bytes.
 *
 * @param content The start of the file.
 * @returns The content type for PNG, JPEG, GIF, WebP and AVIF, or null for anything else.
 */
export function sniffContentType(content: Buffer): string | null {
  if (content.length >= 8 && content.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (content.length >= 3 && content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff) return "image/jpeg";
  if (content.length >= 6 && (content.toString("latin1", 0, 6) === "GIF87a" || content.toString("latin1", 0, 6) === "GIF89a")) return "image/gif";
  if (content.length >= 12 && content.toString("latin1", 0, 4) === "RIFF" && content.toString("latin1", 8, 12) === "WEBP") return "image/webp";

  if (content.length >= 16 && content.toString("latin1", 4, 8) === "ftyp") {
    const size = content.readUInt32BE(0);
    const end = Math.min(Math.max(size, 16), content.length);
    const brands = [content.toString("latin1", 8, 12)];
    for (let offset = 16; offset + 4 <= end; offset += 4) brands.push(content.toString("latin1", offset, offset + 4));
    if (brands.some((brand) => brand === "avif" || brand === "avis")) return "image/avif";
  }

  return null;
}

function requestOnce(url: URL, signal: AbortSignal): Promise<http.IncomingMessage> {
  return new Promise((resolve, reject) => {
    const client = url.protocol === "https:" ? https : http;
    const request = client.request(
      url,
      {
        method: "GET",
        agent: false,
        lookup: safeLookup as never,
        timeout: CONNECT_TIMEOUT_MS,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; ImageProxy/1.0)", Accept: "image/*" }
      },
      resolve
    );

    request.on("timeout", () => request.destroy(new Error("The connection timed out.")));
    request.on("error", reject);
    signal.addEventListener("abort", () => request.destroy(new Error("The fetch took too long.")), { once: true });
    request.end();
  });
}

async function readBody(response: http.IncomingMessage): Promise<Buffer | null> {
  const declared = Number(response.headers["content-length"] ?? "0");
  if (declared > MAX_BYTES) {
    response.destroy();
    return null;
  }

  const chunks: Buffer[] = [];
  let total = 0;

  for await (const chunk of response) {
    const piece = chunk as Buffer;
    total += piece.length;
    if (total > MAX_BYTES) {
      response.destroy();
      return null;
    }
    chunks.push(piece);
  }

  return Buffer.concat(chunks);
}

/**
 * Downloads an image, following a few redirects and refusing anything that is not a small picture
 * in an allowed format served from the public internet.
 *
 * @param start The original address.
 * @returns The image, or null when it was refused or could not be fetched.
 */
export async function fetchImage(start: string): Promise<FetchedImage | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OVERALL_TIMEOUT_MS);

  try {
    let current: URL;
    try {
      current = new URL(start);
    } catch {
      return null;
    }

    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      if (!isFetchable(current)) return null;

      const literal = current.hostname.replace(/^\[|\]$/g, "");
      if (net.isIP(literal) !== 0 && !isPublicAddress(literal)) return null;

      const response = await requestOnce(current, controller.signal);
      const status = response.statusCode ?? 0;

      if ([301, 302, 303, 307, 308].includes(status)) {
        const location = response.headers.location;
        response.resume();
        if (!location) return null;
        try {
          current = new URL(location, current);
        } catch {
          return null;
        }
        continue;
      }

      if (status !== 200) {
        response.resume();
        return null;
      }

      const declared = (response.headers["content-type"] ?? "").split(";")[0].trim().toLowerCase();
      if (!ALLOWED_TYPES.has(declared)) {
        response.resume();
        return null;
      }

      const content = await readBody(response);
      if (!content) return null;

      const contentType = sniffContentType(content);
      return contentType ? { content, contentType } : null;
    }

    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const WINDOW_MS = 60_000;
const REQUESTS_PER_WINDOW = 120;
const MAX_CONCURRENT = 16;
const windows = new Map<string, { count: number; resetsAt: number }>();
let active = 0;

/**
 * Counts a request against a visitor's allowance and the proxy's total load.
 *
 * @param visitor Who is asking, as an address.
 * @returns A release function when the request may go ahead, or null when it is over a limit.
 */
export function acquireSlot(visitor: string): (() => void) | null {
  const now = Date.now();

  if (windows.size > 5000) {
    for (const [key, entry] of windows) if (entry.resetsAt <= now) windows.delete(key);
  }

  const entry = windows.get(visitor);
  if (!entry || entry.resetsAt <= now) {
    windows.set(visitor, { count: 1, resetsAt: now + WINDOW_MS });
  } else if (entry.count >= REQUESTS_PER_WINDOW) {
    return null;
  } else {
    entry.count++;
  }

  if (active >= MAX_CONCURRENT) return null;

  active++;
  let released = false;

  return () => {
    if (released) return;
    released = true;
    active--;
  };
}
