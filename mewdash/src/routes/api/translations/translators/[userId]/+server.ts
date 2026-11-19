import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { requiredParam, translateEndpoint } from "$lib/server/translations/http";
import { removeTranslator } from "$lib/server/translations/store";
import { isUserId } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

export const DELETE: RequestHandler = translateEndpoint("admin", true, async ({ params, url }) => {
  if (!isUserId(params.userId)) throw new WikiError("user_id_invalid", 400, "userId");
  await removeTranslator(params.userId, requiredParam(url, "locale", 32));
  return json({ ok: true });
});
