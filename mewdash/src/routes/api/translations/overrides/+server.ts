import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { actorOf, readBody } from "$lib/server/wiki/http";
import { requiredParam, translateEndpoint } from "$lib/server/translations/http";
import { revertOverride, saveOverride } from "$lib/server/translations/store";
import type { RequestHandler } from "./$types";

export const PUT: RequestHandler = translateEndpoint("reviewer", true, async ({ request }, access) => {
  const body = await readBody(request);
  if (typeof body.catalog !== "string" || typeof body.key !== "string" || typeof body.locale !== "string") {
    throw new WikiError("bad_request");
  }
  return json(await saveOverride(body.catalog, body.key, body.locale, body.text, actorOf(access), access.scope));
});

export const DELETE: RequestHandler = translateEndpoint("reviewer", true, async ({ url }, access) => {
  return json(
    await revertOverride(
      requiredParam(url, "catalog", 32),
      requiredParam(url, "key", 200),
      requiredParam(url, "locale", 32),
      actorOf(access),
      access.scope,
    ),
  );
});
