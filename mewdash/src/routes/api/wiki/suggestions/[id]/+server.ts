import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { actorOf, readBody, wikiEndpoint } from "$lib/server/wiki/http";
import { approveSuggestion, declineSuggestion } from "$lib/server/wiki/store";
import { isRowId, optionalText, wikiLimits } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = wikiEndpoint("editor", true, async ({ request, params }, access) => {
  if (!isRowId(params.id)) throw new WikiError("not_found", 404);
  const body = await readBody(request);

  if (body.action === "approve") {
    const revisionId = await approveSuggestion(params.id, actorOf(access));
    return json({ revisionId });
  }
  if (body.action === "decline") {
    const reason = optionalText(body.reason, wikiLimits.reasonMax, "reason_too_long");
    if (!reason.ok) throw new WikiError(reason.error, 400, "reason");
    await declineSuggestion(params.id, actorOf(access), reason.value);
    return json({ ok: true });
  }
  throw new WikiError("bad_request", 400, "action");
});
