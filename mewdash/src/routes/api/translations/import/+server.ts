import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { actorOf } from "$lib/server/wiki/http";
import { readLargeBody, translateEndpoint } from "$lib/server/translations/http";
import { importTranslations } from "$lib/server/translations/transfer";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = translateEndpoint("admin", true, async ({ request, url }, access) => {
  const body = await readLargeBody(request);
  if (typeof body.catalog !== "string" || typeof body.locale !== "string") throw new WikiError("bad_request");
  return json(await importTranslations(body.catalog, body.locale, body.format, body.content, actorOf(access), url.searchParams.get("apply") === "true"));
});
