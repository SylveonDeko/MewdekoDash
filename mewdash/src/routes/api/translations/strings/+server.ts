import { json } from "@sveltejs/kit";
import { stringQueryFrom, translateEndpoint } from "$lib/server/translations/http";
import { listStrings } from "$lib/server/translations/store";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = translateEndpoint("none", true, async ({ url }, access) => {
  return json(await listStrings(stringQueryFrom(url), access.userId));
});
