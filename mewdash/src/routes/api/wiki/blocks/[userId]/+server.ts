import { json } from "@sveltejs/kit";
import { unblockUser } from "$lib/server/wiki/blocks";
import { WikiError } from "$lib/server/wiki/errors";
import { wikiEndpoint } from "$lib/server/wiki/http";
import { isUserId } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

export const DELETE: RequestHandler = wikiEndpoint("admin", true, async ({ params }) => {
  if (!isUserId(params.userId)) throw new WikiError("user_id_invalid", 400, "userId");
  await unblockUser(params.userId);
  return json({ ok: true });
});
