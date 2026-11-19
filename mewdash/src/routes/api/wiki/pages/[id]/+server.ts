import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { readBody, wikiEndpoint } from "$lib/server/wiki/http";
import { deletePage, updatePage } from "$lib/server/wiki/store";
import { isRowId, validatePageFields } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

export const PATCH: RequestHandler = wikiEndpoint("editor", true, async ({ request, params }) => {
  if (!isRowId(params.id)) throw new WikiError("not_found", 404);
  const fields = validatePageFields(await readBody(request), true);
  if (!fields.ok) throw new WikiError(fields.error, 400, fields.field);
  await updatePage(params.id, fields.value);
  return json({ ok: true });
});

export const DELETE: RequestHandler = wikiEndpoint("editor", true, async ({ params }) => {
  if (!isRowId(params.id)) throw new WikiError("not_found", 404);
  await deletePage(params.id);
  return json({ ok: true });
});
