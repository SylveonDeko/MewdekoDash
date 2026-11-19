import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { actorOf, wikiEndpoint } from "$lib/server/wiki/http";
import { resolveFeedback } from "$lib/server/wiki/store";
import { isRowId } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = wikiEndpoint("editor", true, async ({ params }, access) => {
  if (!isRowId(params.id)) throw new WikiError("not_found", 404);
  await resolveFeedback(params.id, actorOf(access));
  return json({ ok: true });
});
