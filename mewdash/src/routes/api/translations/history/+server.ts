import { json } from "@sveltejs/kit";
import { requiredParam, translateEndpoint } from "$lib/server/translations/http";
import { getCurrentTranslation, getHistory } from "$lib/server/translations/store";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = translateEndpoint("none", true, async ({ url }, access) => {
  const catalog = requiredParam(url, "catalog", 32);
  const key = requiredParam(url, "key", 200);
  const locale = requiredParam(url, "locale", 32);
  const entries = await getHistory(catalog, key, locale, access.userId, access.scope);
  const current = await getCurrentTranslation(catalog, key, locale);
  return json({ entries, current });
});
