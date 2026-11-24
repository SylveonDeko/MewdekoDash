import { json } from "@sveltejs/kit";
import { getAnalytics } from "$lib/server/wiki/insights";
import { wikiEndpoint } from "$lib/server/wiki/http";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = wikiEndpoint("editor", true, async ({ url }) => {
  const requested = Number(url.searchParams.get("days"));
  const days = requested === 7 || requested === 90 ? requested : 30;
  return json(await getAnalytics(days));
});
