import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { readBody, wikiEndpoint } from "$lib/server/wiki/http";
import { reorderCategory } from "$lib/server/wiki/store";
import { isRowId } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = wikiEndpoint("editor", true, async ({ request }) => {
  const body = await readBody(request);
  if (typeof body.category !== "string" || !body.category || !Array.isArray(body.ids) || !body.ids.every(isRowId)) {
    throw new WikiError("bad_request");
  }
  await reorderCategory(body.category, body.ids as string[]);
  return json({ ok: true });
});
