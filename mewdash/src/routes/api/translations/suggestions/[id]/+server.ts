import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { actorOf, readBody } from "$lib/server/wiki/http";
import { translateEndpoint } from "$lib/server/translations/http";
import { approveSuggestion, declineSuggestion } from "$lib/server/translations/store";
import { translationLimits } from "$lib/translate/rules";
import { isRowId, optionalText } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = translateEndpoint("reviewer", true, async ({ request, params }, access) => {
  if (!isRowId(params.id)) throw new WikiError("not_found", 404);
  const body = await readBody(request);

  if (body.action === "approve") {
    return json(await approveSuggestion(params.id, actorOf(access), access.scope));
  }
  if (body.action === "decline") {
    const reason = optionalText(body.reason, translationLimits.reasonMax, "reason_too_long");
    if (!reason.ok) throw new WikiError(reason.error, 400, "reason");
    await declineSuggestion(params.id, actorOf(access), access.scope, reason.value);
    return json({ ok: true });
  }
  throw new WikiError("bad_request", 400, "action");
});
