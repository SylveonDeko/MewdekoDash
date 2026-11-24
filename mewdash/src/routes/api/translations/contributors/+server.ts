import { json } from "@sveltejs/kit";
import { listContributors } from "$lib/server/translations/contributors";
import { pageParam, translateEndpoint } from "$lib/server/translations/http";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = translateEndpoint("admin", true, async ({ url }) => {
  const locale = url.searchParams.get("locale");
  return json(await listContributors(locale && locale.length <= 32 ? locale : null, pageParam(url)));
});
