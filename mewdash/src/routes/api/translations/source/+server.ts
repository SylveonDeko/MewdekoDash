import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { readLargeBody, translateEndpoint } from "$lib/server/translations/http";
import { importSource } from "$lib/server/translations/transfer";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = translateEndpoint("admin", true, async ({ request, url }) => {
  const body = await readLargeBody(request);
  if (typeof body.catalog !== "string") throw new WikiError("bad_request");
  return json(await importSource(body.catalog, body.format, body.content, url.searchParams.get("apply") === "true"));
});
