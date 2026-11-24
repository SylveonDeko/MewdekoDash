import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { pageParam, translateEndpoint } from "$lib/server/translations/http";
import { listMySuggestions } from "$lib/server/translations/store";
import { isUserId } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = translateEndpoint("admin", true, async ({ params, url }) => {
  if (!isUserId(params.userId)) throw new WikiError("user_id_invalid", 400, "userId");
  return json(await listMySuggestions(params.userId, pageParam(url)));
});
