import { json } from "@sveltejs/kit";
import { createCategory } from "$lib/server/wiki/categories";
import { WikiError } from "$lib/server/wiki/errors";
import { readBody, wikiEndpoint } from "$lib/server/wiki/http";
import { validateCategory } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = wikiEndpoint("editor", true, async ({ request }) => {
  const fields = validateCategory(await readBody(request));
  if (!fields.ok) throw new WikiError(fields.error, 400, fields.field);
  const id = await createCategory(fields.value);
  return json({ id }, { status: 201 });
});
