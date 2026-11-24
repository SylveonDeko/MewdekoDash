const botAgent =
  /bot|crawl|spider|slurp|preview|unfurl|facebookexternalhit|embedly|whatsapp|mastodon|pinterest|vkshare|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python|httpclient|okhttp|go-http|node-fetch|axios|java\/|libwww|scrapy|phantom/i;

const purposeHeaders = ["sec-purpose", "purpose", "x-purpose", "x-moz"];

export const missQueryMax = 100;

/**
 * Whether a request may be counted as a reader. Requests without a user agent, from crawlers,
 * link unfurlers and monitors, and browser prefetches and prerenders are not.
 *
 * @param userAgent The user agent header.
 * @param header Reads a request header by name.
 */
export function isCountable(userAgent: string | null, header: (name: string) => string | null): boolean {
  if (!userAgent || !userAgent.trim() || botAgent.test(userAgent)) return false;
  for (const name of purposeHeaders) {
    const value = (header(name) ?? "").toLowerCase();
    if (value.includes("prefetch") || value.includes("prerender") || value.includes("preview")) return false;
  }
  return true;
}

/**
 * Cleans a search text for counting: trimmed, lower case, whitespace collapsed and capped. Text
 * that could identify someone, such as an email address, a link or a long number, is dropped.
 *
 * @param query What was searched for.
 * @returns The text to count, or null when it should not be recorded.
 */
export function normaliseMissQuery(query: string): string | null {
  const value = query.replace(/[\p{C}\s]+/gu, " ").trim().toLowerCase();
  if ([...value].length < 2 || value.includes("@") || value.includes("://") || /\d{8,}/.test(value)) return null;
  return [...value].slice(0, missQueryMax).join("").trimEnd();
}

/**
 * The day a view or miss is counted under, in UTC.
 *
 * @param now The current time.
 */
export function dayKey(now: Date): string {
  return now.toISOString().slice(0, 10);
}
