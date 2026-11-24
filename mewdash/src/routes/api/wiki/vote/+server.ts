import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { readBody, requireLocale, wikiEndpoint } from "$lib/server/wiki/http";
import { addressOf, takeUse } from "$lib/server/wiki/limits";
import { browserVoterKey, getVote, setVote, userVoterKey } from "$lib/server/wiki/votes";
import { isCountable } from "$lib/wiki/tracking";
import { isRowId, validateVote } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

const votesPerHour = 30;
const hourMs = 60 * 60 * 1000;

export const GET: RequestHandler = wikiEndpoint("none", true, async ({ url }, access) => {
  const pageId = url.searchParams.get("pageId");
  if (!isRowId(pageId)) throw new WikiError("not_found", 404);
  const locale = requireLocale(url.searchParams.get("locale"));
  const vote = access.userId ? await getVote(pageId, locale, userVoterKey(access.userId)) : null;
  return json({ vote }, { headers: { "Cache-Control": "no-store" } });
});

export const POST: RequestHandler = wikiEndpoint("none", true, async (event, access) => {
  const { request } = event;
  if (!isCountable(request.headers.get("user-agent"), (name) => request.headers.get(name))) throw new WikiError("bad_request");
  const body = await readBody(request);
  if (!isRowId(body.pageId)) throw new WikiError("not_found", 404);
  const locale = requireLocale(body.locale);
  const vote = validateVote(body);
  if (!vote.ok) throw new WikiError(vote.error, 400, vote.field);

  const key = access.userId ? userVoterKey(access.userId) : vote.value.browserKey ? browserVoterKey(vote.value.browserKey) : null;
  if (!key) throw new WikiError("bad_request", 400, "browserKey");
  if (!takeUse("vote", addressOf(event), votesPerHour, hourMs)) throw new WikiError("rate_limited", 429);

  await setVote(body.pageId, locale, vote.value.helpful, key, access.userId);
  return json({ ok: true, vote: vote.value.helpful });
});
