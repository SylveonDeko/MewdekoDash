// lib/server/analyticsBeacon.ts
import { createHash, randomBytes } from "node:crypto";
import { env } from "$env/dynamic/private";
import type { RequestEvent } from "@sveltejs/kit";
import { logger } from "$lib/logger";
import { defaultInstanceURL } from "$lib/server/instances";
import type { PageViewSample } from "$lib/api/analytics/models";

const FLUSH_MS = 10_000;
const FLUSH_AT_ROWS = 200;
const MAX_BUFFER = 2_000;

const SKIP_PREFIXES = ["/api/", "/cdn/", "/_app/", "/dashboard/analytics"];
const STATIC_FILE = /\.(?:js|mjs|css|map|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|otf|txt|xml|json|webmanifest)$/i;

let buffer: PageViewSample[] = [];
let timer: NodeJS.Timeout | null = null;
let flushing = false;

let saltDay = "";
let salt = "";

/** The visitor salt rotates daily, so a hash never links visits across days. */
function dailySalt(): string {
  const day = new Date().toISOString().slice(0, 10);
  if (day !== saltDay) {
    saltDay = day;
    salt = randomBytes(16).toString("hex");
  }
  return salt;
}

function visitorHash(event: RequestEvent): string | null {
  let ip = "";
  try {
    ip = event.getClientAddress();
  } catch {
    ip = event.request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  }
  const ua = event.request.headers.get("user-agent") ?? "";
  if (!ip && !ua) return null;
  return createHash("sha256").update(`${ip}|${ua}|${dailySalt()}`).digest("hex").slice(0, 16);
}

function device(userAgent: string | null): string {
  const ua = (userAgent ?? "").toLowerCase();
  if (!ua) return "bot";
  if (/bot|crawl|spider|slurp|curl|wget|python-requests|httpclient|headless/.test(ua)) return "bot";
  if (/ipad|tablet|(android(?!.*mobile))/.test(ua)) return "tablet";
  if (/mobi|iphone|ipod|android|blackberry|windows phone/.test(ua)) return "mobile";
  return "desktop";
}

function locale(acceptLanguage: string | null): string | null {
  const first = acceptLanguage?.split(",")[0]?.split(";")[0]?.trim();
  return first ? first.slice(0, 16) : null;
}

function shouldSkip(pathname: string): boolean {
  return SKIP_PREFIXES.some((p) => pathname.startsWith(p)) || STATIC_FILE.test(pathname);
}

async function flush(): Promise<void> {
  if (flushing || buffer.length === 0) return;
  const batch = buffer;
  buffer = [];
  flushing = true;
  try {
    const base = await defaultInstanceURL();
    if (!base) return;
    const response = await fetch(`${base}/Analytics/page`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": env.MEWDEKO_API_KEY,
      },
      body: JSON.stringify(batch),
    });
    if (!response.ok) {
      logger.debug(`Analytics beacon rejected (${response.status}); dropped ${batch.length} rows`);
    }
  } catch (err) {
    logger.debug("Analytics beacon flush failed", err);
  } finally {
    flushing = false;
  }
}

function ensureTimer(): void {
  if (timer) return;
  timer = setInterval(() => {
    void flush();
  }, FLUSH_MS);
  timer.unref?.();
}

/**
 * Queues one dashboard request for the bot's page view analytics. Never throws
 * and never blocks the response: rows are batched in memory and posted every
 * ten seconds, or as soon as two hundred are waiting.
 *
 * Only requests that matched a SvelteKit route are recorded. An unmatched
 * request has no route template, and recording its raw path would fill the
 * analytics with scanner probes like /wp-json/batch/v1.
 */
export function recordPageView(event: RequestEvent, response: Response, startedAt: number): void {
  try {
    const route = event.route.id;
    if (!route || shouldSkip(event.url.pathname)) return;
    if (!env.MEWDEKO_API_KEY) return;

    const headers = event.request.headers;
    const sample: PageViewSample = {
      at: new Date().toISOString(),
      route,
      method: event.request.method,
      status: response.status,
      durationMs: Math.max(0, Date.now() - startedAt),
      visitorHash: visitorHash(event),
      locale: locale(headers.get("accept-language")),
      device: device(headers.get("user-agent")),
      guildSize: null,
      isOwner: false,
    };

    if (buffer.length >= MAX_BUFFER) buffer.shift();
    buffer.push(sample);
    ensureTimer();
    if (buffer.length >= FLUSH_AT_ROWS) void flush();
  } catch (err) {
    logger.debug("Analytics beacon skipped a request", err);
  }
}
