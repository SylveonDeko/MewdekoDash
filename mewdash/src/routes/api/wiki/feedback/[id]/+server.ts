import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { actorOf, readBody, wikiEndpoint } from "$lib/server/wiki/http";
import { setFeedbackStatus } from "$lib/server/wiki/store";
import { isFeedbackStatus, isRowId } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = wikiEndpoint("editor", true, async ({ request, params }, access) => {
  if (!isRowId(params.id)) throw new WikiError("not_found", 404);
  const body = await readBody(request);
  const status = body.status === undefined ? "resolved" : body.status;
  if (!isFeedbackStatus(status)) throw new WikiError("status_invalid", 400, "status");
  await setFeedbackStatus(params.id, status, actorOf(access));
  return json({ ok: true });
});
