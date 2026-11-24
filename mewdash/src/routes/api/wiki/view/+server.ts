import { WikiError } from "$lib/server/wiki/errors";
import { readBody, requireLocale, wikiEndpoint } from "$lib/server/wiki/http";
import { recordView } from "$lib/server/wiki/insights";
import { addressOf, firstUse, takeUse, visitorOf } from "$lib/server/wiki/limits";
import { isCountable } from "$lib/wiki/tracking";
import { isRowId } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

const viewsPerHour = 600;
const hourMs = 60 * 60 * 1000;

export const POST: RequestHandler = wikiEndpoint("none", true, async (event) => {
  const { request } = event;
  const none = new Response(null, { status: 204 });
  if (!isCountable(request.headers.get("user-agent"), (name) => request.headers.get(name))) return none;

  const body = await readBody(request);
  if (!isRowId(body.pageId)) throw new WikiError("not_found", 404);
  const locale = requireLocale(body.locale);

  if (!firstUse("view", `${visitorOf(event)}|${body.pageId}|${locale}`, 15_000)) return none;
  if (!takeUse("view-hour", addressOf(event), viewsPerHour, hourMs)) return none;

  await recordView(body.pageId, locale);
  return none;
});
