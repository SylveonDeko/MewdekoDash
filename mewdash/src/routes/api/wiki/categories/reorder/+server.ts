import { json } from "@sveltejs/kit";
import { reorderCategories } from "$lib/server/wiki/categories";
import { WikiError } from "$lib/server/wiki/errors";
import { readBody, wikiEndpoint } from "$lib/server/wiki/http";
import { isRowId } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = wikiEndpoint("editor", true, async ({ request }) => {
  const body = await readBody(request);
  if (!Array.isArray(body.ids) || !body.ids.every(isRowId)) throw new WikiError("bad_request");
  await reorderCategories(body.ids as string[]);
  return json({ ok: true });
});
