import { json } from "@sveltejs/kit";
import { readBody } from "$lib/server/wiki/http";
import { translateEndpoint } from "$lib/server/translations/http";
import { getSettings, saveSettings } from "$lib/server/translations/settings";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = translateEndpoint("admin", true, async () => {
  return json(await getSettings());
});

export const PUT: RequestHandler = translateEndpoint("admin", true, async ({ request }, access) => {
  const body = await readBody(request);
  return json(await saveSettings({ suggestionsOpen: body.suggestionsOpen, openSuggestionsMax: body.openSuggestionsMax }, access.userId as string));
});
