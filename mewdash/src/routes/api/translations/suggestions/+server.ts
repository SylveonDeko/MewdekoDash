import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { actorOf, readBody } from "$lib/server/wiki/http";
import { translateEndpoint } from "$lib/server/translations/http";
import { submitSuggestion } from "$lib/server/translations/store";
import { canSuggestTranslation } from "$lib/translate/permissions";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = translateEndpoint("member", true, async ({ request }, access) => {
  if (!canSuggestTranslation(access.userId !== null)) throw new WikiError("unauthorized", 401);
  const body = await readBody(request);
  if (typeof body.catalog !== "string" || typeof body.key !== "string" || typeof body.locale !== "string") {
    throw new WikiError("bad_request");
  }
  const id = await submitSuggestion(body.catalog, body.key, body.locale, body.text, actorOf(access));
  return json({ id }, { status: 201 });
});
