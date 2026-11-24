import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { actorOf } from "$lib/server/wiki/http";
import { saveMany } from "$lib/server/translations/bulk";
import { readLargeBody, translateEndpoint } from "$lib/server/translations/http";
import { canSuggestTranslation } from "$lib/translate/permissions";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = translateEndpoint("member", true, async ({ request }, access) => {
  if (!canSuggestTranslation(access.userId !== null)) throw new WikiError("unauthorized", 401);
  const body = await readLargeBody(request);
  if (typeof body.catalog !== "string" || typeof body.locale !== "string") throw new WikiError("bad_request");
  return json(await saveMany(body.catalog, body.locale, body.items, actorOf(access), access.scope));
});
