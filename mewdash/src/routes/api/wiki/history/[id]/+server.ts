import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { getPublicRevisionPair } from "$lib/server/wiki/history";
import { wikiEndpoint } from "$lib/server/wiki/http";
import { isRowId } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = wikiEndpoint("none", true, async ({ params }) => {
  if (!isRowId(params.id)) throw new WikiError("not_found", 404);
  const pair = await getPublicRevisionPair(params.id);
  if (!pair) throw new WikiError("not_found", 404);
  return json(pair);
});
