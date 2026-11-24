import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { actorOf, readBody } from "$lib/server/wiki/http";
import { restoreTranslation } from "$lib/server/translations/bulk";
import { translateEndpoint } from "$lib/server/translations/http";
import { isRowId } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = translateEndpoint("reviewer", true, async ({ request }, access) => {
  const body = await readBody(request);
  if (typeof body.catalog !== "string" || typeof body.key !== "string" || typeof body.locale !== "string") {
    throw new WikiError("bad_request");
  }
  if (typeof body.id !== "string" || !isRowId(body.id)) throw new WikiError("bad_request", 400, "id");
  return json(await restoreTranslation(body.catalog, body.key, body.locale, body.id, actorOf(access), access.scope));
});
