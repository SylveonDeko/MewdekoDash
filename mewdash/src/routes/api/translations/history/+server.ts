import { json } from "@sveltejs/kit";
import { requiredParam, translateEndpoint } from "$lib/server/translations/http";
import { getHistory } from "$lib/server/translations/store";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = translateEndpoint("none", true, async ({ url }, access) => {
  const entries = await getHistory(
    requiredParam(url, "catalog", 32),
    requiredParam(url, "key", 200),
    requiredParam(url, "locale", 32),
    access.userId,
    access.scope,
  );
  return json({ entries });
});
