import { json } from "@sveltejs/kit";
import { pageParam, statusParam, translateEndpoint } from "$lib/server/translations/http";
import { listQueue } from "$lib/server/translations/store";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = translateEndpoint("reviewer", true, async ({ url }, access) => {
  const catalog = url.searchParams.get("catalog") || null;
  const locale = url.searchParams.get("locale") || null;
  return json(await listQueue(access.scope, { catalog, locale, status: statusParam(url) }, pageParam(url)));
});
