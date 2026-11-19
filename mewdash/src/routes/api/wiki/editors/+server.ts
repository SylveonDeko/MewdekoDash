import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { readBody, wikiEndpoint } from "$lib/server/wiki/http";
import { addEditor, knownName } from "$lib/server/wiki/store";
import { collapseWhitespace, isUserId, wikiLimits } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = wikiEndpoint("admin", true, async ({ request }, access) => {
  const body = await readBody(request);
  if (!isUserId(body.userId)) throw new WikiError("user_id_invalid", 400, "userId");

  let name = typeof body.name === "string" ? collapseWhitespace(body.name) : "";
  if ([...name].length > wikiLimits.nameMax) throw new WikiError("name_too_long", 400, "name");
  if (!name) name = (await knownName(body.userId)) ?? (body.userId === access.userId ? access.name : body.userId);

  await addEditor(body.userId, name, access.userId as string);
  return json({ ok: true, name }, { status: 201 });
});
