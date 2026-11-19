import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { wikiEndpoint } from "$lib/server/wiki/http";
import { removeEditor } from "$lib/server/wiki/store";
import { isUserId } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

export const DELETE: RequestHandler = wikiEndpoint("admin", true, async ({ params }) => {
  if (!isUserId(params.userId)) throw new WikiError("user_id_invalid", 400, "userId");
  await removeEditor(params.userId);
  return json({ ok: true });
});
