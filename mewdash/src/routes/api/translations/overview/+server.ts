import { json } from "@sveltejs/kit";
import { translateEndpoint } from "$lib/server/translations/http";
import { getOverview } from "$lib/server/translations/store";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = translateEndpoint("none", true, async () => {
  return json({ catalogs: await getOverview() });
});
