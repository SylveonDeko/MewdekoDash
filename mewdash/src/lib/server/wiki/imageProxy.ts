import { createHmac, timingSafeEqual } from "node:crypto";
import { lookup as dnsLookup } from "node:dns";
import { request, type RequestOptions } from "node:https";
import { BlockList, isIP } from "node:net";
import { env } from "$env/dynamic/private";
import { externalImageUrl, proxyPrefix, sniffImage, type ImageType } from "$lib/wiki/images";

const fetchMax = 4 * 1024 * 1024;
const fetchTimeoutMs = 8_000;
const cacheTtlMs = 60 * 60 * 1000;
const cacheEntries = 100;
const cacheBytes = 32 * 1024 * 1024;
const maxInFlight = 6;

const blocked = new BlockList();
for (const [address, prefix] of [
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
  ["240.0.0.0", 4],
] as const) {
  blocked.addSubnet(address, prefix, "ipv4");
}
for (const [address, prefix] of [
  ["::", 128],
  ["::1", 128],
  ["::ffff:0:0", 96],
  ["64:ff9b::", 96],
  ["100::", 64],
  ["2001::", 32],
  ["2001:db8::", 32],
  ["2002::", 16],
  ["fc00::", 7],
  ["fe80::", 10],
  ["fec0::", 10],
  ["ff00::", 8],
] as const) {
  blocked.addSubnet(address, prefix, "ipv6");
}

/** True when the address is one the public internet can be reached at. */
export function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 0) return false;
  return !blocked.check(address, family === 4 ? "ipv4" : "ipv6");
}

function signingKey(): string | null {
  const secret = env.COOKIE_ENCRYPTION_PASSWORD;
  return secret ? createHmac("sha256", secret).update("wiki-image-proxy").digest("hex") : null;
}

function signature(url: string): string | null {
  const key = signingKey();
  return key ? createHmac("sha256", key).update(url).digest("hex").slice(0, 32) : null;
}

/** Whether a signature belongs to an address. */
export function signatureMatches(url: string, given: string): boolean {
  const expected = signature(url);
  if (!expected || expected.length !== given.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(given));
}

/**
 * Gives the address an image in an article is loaded from. Images on this site are used as
 * written. Images on other sites are loaded through this server, so the reader's address is not
 * shown to the site an author picked. Anything else is left out.
 *
 * @param src The image address after sanitising.
 */
export function proxiedImageSrc(src: string): string | null {
  if (src.startsWith("/")) return src;
  const external = externalImageUrl(src);
  const sig = external ? signature(external) : null;
  if (!external || !sig) return null;
  return `${proxyPrefix}${sig}?u=${encodeURIComponent(external)}`;
}

/** A failure while fetching an outside image, with the status to answer with. */
export class ProxyError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const publicLookup = ((hostname: string, options: { all?: boolean; family?: number }, callback: (...args: unknown[]) => void) => {
  dnsLookup(hostname, { ...options, all: true }, (error, addresses) => {
    if (error) return callback(error);
    const list = addresses as Array<{ address: string; family: number }>;
    if (list.length === 0 || !list.every((entry) => isPublicAddress(entry.address))) {
      return callback(new ProxyError(400, "The address is not public"));
    }
    return options.all ? callback(null, list) : callback(null, list[0].address, list[0].family);
  });
}) as unknown as NonNullable<RequestOptions["lookup"]>;

function download(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const req = request(
      url,
      {
        method: "GET",
        lookup: publicLookup,
        headers: { Accept: "image/png,image/jpeg,image/gif,image/webp", "User-Agent": "MewdekoWikiImages/1" },
      },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new ProxyError(502, "The image could not be loaded"));
        }
        const declared = Number(res.headers["content-length"] ?? "0");
        if (declared > fetchMax) {
          res.resume();
          return reject(new ProxyError(413, "The image is too large"));
        }
        const chunks: Buffer[] = [];
        let size = 0;
        res.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > fetchMax) {
            req.destroy(new ProxyError(413, "The image is too large"));
            return;
          }
          chunks.push(chunk);
        });
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      },
    );
    req.setTimeout(fetchTimeoutMs, () => req.destroy(new ProxyError(504, "The image took too long")));
    const overall = setTimeout(() => req.destroy(new ProxyError(504, "The image took too long")), fetchTimeoutMs);
    req.on("close", () => clearTimeout(overall));
    req.on("error", (error) => reject(error instanceof ProxyError ? error : new ProxyError(502, "The image could not be loaded")));
    req.end();
  });
}

interface CacheEntry {
  type: ImageType;
  data: Buffer;
  at: number;
}

const cache = new Map<string, CacheEntry>();
let cachedBytes = 0;
let inFlight = 0;

function remember(url: string, entry: CacheEntry): void {
  cache.set(url, entry);
  cachedBytes += entry.data.length;
  for (const [key, old] of cache) {
    if (cache.size <= cacheEntries && cachedBytes <= cacheBytes) break;
    cache.delete(key);
    cachedBytes -= old.data.length;
  }
}

/**
 * Loads an image from another site for a reader. The address must pass {@link externalImageUrl},
 * every address the host resolves to must be public, redirects are not followed, the size and
 * time are capped, and the type comes from the bytes.
 *
 * @param url A checked address.
 */
export async function fetchExternalImage(url: string): Promise<{ type: ImageType; data: Buffer }> {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < cacheTtlMs) return hit;
  if (hit) {
    cache.delete(url);
    cachedBytes -= hit.data.length;
  }

  const literal = new URL(url).hostname.replace(/^\[|\]$/g, "");
  if (isIP(literal) !== 0 && !isPublicAddress(literal)) throw new ProxyError(400, "The address is not public");

  if (inFlight >= maxInFlight) throw new ProxyError(503, "Too many images are loading");
  inFlight++;
  try {
    const data = await download(url);
    const type = sniffImage(data);
    if (!type) throw new ProxyError(415, "The file is not a supported image");
    const entry = { type, data, at: Date.now() };
    remember(url, entry);
    return entry;
  } finally {
    inFlight--;
  }
}
