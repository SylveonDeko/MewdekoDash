import { json } from "@sveltejs/kit";
import { pageParam, translateEndpoint } from "$lib/server/translations/http";
import { listMySuggestions } from "$lib/server/translations/store";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = translateEndpoint("member", true, async ({ url }, access) => {
  return json(await listMySuggestions(access.userId as string, pageParam(url)));
});
