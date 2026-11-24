import type { RequestEvent } from "@sveltejs/kit";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const pruneAbove = 5_000;

function prune(now: number): void {
  if (buckets.size < pruneAbove) return;
  for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
  if (buckets.size >= pruneAbove * 2) buckets.clear();
}

/**
 * Takes one of the allowed uses of something in a time window. Counters live in memory only.
 *
 * @param scope What is being limited, such as `vote`.
 * @param key Who is limited.
 * @param max How many uses the window allows.
 * @param windowMs How long the window lasts in milliseconds.
 * @returns True when the use may go ahead.
 */
export function takeUse(scope: string, key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  prune(now);
  const id = `${scope}:${key}`;
  const bucket = buckets.get(id);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(id, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= max) return false;
  bucket.count++;
  return true;
}

/**
 * True the first time a key is seen within a time window and false after that.
 *
 * @param scope What is being counted once.
 * @param key What identifies it.
 * @param windowMs How long it is remembered in milliseconds.
 */
export function firstUse(scope: string, key: string, windowMs: number): boolean {
  return takeUse(scope, key, 1, windowMs);
}

/** The address of the client, or an empty string when the server cannot tell. */
export function addressOf(event: RequestEvent): string {
  try {
    return event.getClientAddress();
  } catch {
    return "";
  }
}

/** A key for one visitor: their address and the start of their user agent. */
export function visitorOf(event: RequestEvent): string {
  return `${addressOf(event)}|${(event.request.headers.get("user-agent") ?? "").slice(0, 120)}`;
}
