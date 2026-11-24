import { json } from "@sveltejs/kit";
import { deleteCategory, updateCategory } from "$lib/server/wiki/categories";
import { WikiError } from "$lib/server/wiki/errors";
import { readBody, wikiEndpoint } from "$lib/server/wiki/http";
import { isRowId, validateCategory } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

export const PATCH: RequestHandler = wikiEndpoint("editor", true, async ({ request, params }) => {
  if (!isRowId(params.id)) throw new WikiError("not_found", 404);
  const fields = validateCategory(await readBody(request));
  if (!fields.ok) throw new WikiError(fields.error, 400, fields.field);
  await updateCategory(params.id, fields.value);
  return json({ ok: true });
});

export const DELETE: RequestHandler = wikiEndpoint("editor", true, async ({ params }) => {
  if (!isRowId(params.id)) throw new WikiError("not_found", 404);
  await deleteCategory(params.id);
  return json({ ok: true });
});
