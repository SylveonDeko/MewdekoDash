import { json } from "@sveltejs/kit";
import { logger } from "$lib/logger";
import { searchWikiText } from "$lib/server/wiki";
import { WikiError } from "$lib/server/wiki/errors";
import { wikiEndpoint } from "$lib/server/wiki/http";
import { recordMiss } from "$lib/server/wiki/insights";
import { addressOf, firstUse, takeUse, visitorOf } from "$lib/server/wiki/limits";
import { availableLocales } from "$lib/i18n";
import { sourceLocale } from "$lib/wiki/catalog";
import { searchTerms } from "$lib/wiki/search";
import { isCountable, normaliseMissQuery } from "$lib/wiki/tracking";
import type { RequestHandler } from "./$types";

const searchesPerMinute = 120;
const missesPerHour = 30;

export const GET: RequestHandler = wikiEndpoint("none", false, async (event, access) => {
  const { url, request } = event;
  if (!takeUse("search", addressOf(event), searchesPerMinute, 60_000)) throw new WikiError("rate_limited", 429);

  const requested = url.searchParams.get("locale");
  const locale = requested && availableLocales().includes(requested) ? requested : sourceLocale;
  const text = url.searchParams.get("q") ?? "";
  if (searchTerms(text).length === 0) return json({ hits: [] });

  const hits = await searchWikiText(text, locale);
  if (hits.length === 0 && access.databaseAvailable && isCountable(request.headers.get("user-agent"), (name) => request.headers.get(name))) {
    const cleaned = normaliseMissQuery(text);
    if (cleaned && firstUse("miss", `${visitorOf(event)}|${cleaned}`, 60_000) && takeUse("miss-hour", addressOf(event), missesPerHour, 3_600_000)) {
      void recordMiss(cleaned, locale).catch((error) => logger.warn("Recording a missed search failed:", error));
    }
  }
  return json({ hits });
});
