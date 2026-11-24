import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { readBody, wikiEndpoint } from "$lib/server/wiki/http";
import { readSettings, writeSettings } from "$lib/server/wiki/settings";
import { validateSettings } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

export const PATCH: RequestHandler = wikiEndpoint("admin", true, async ({ request }, access) => {
  const patch = validateSettings(await readBody(request));
  if (!patch.ok) throw new WikiError(patch.error, 400, patch.field);
  await writeSettings(patch.value, access.userId as string);
  return json(await readSettings());
});
