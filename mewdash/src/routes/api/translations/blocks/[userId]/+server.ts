import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { unblockUser } from "$lib/server/translations/contributors";
import { translateEndpoint } from "$lib/server/translations/http";
import { isUserId } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

export const DELETE: RequestHandler = translateEndpoint("admin", true, async ({ params }) => {
  if (!isUserId(params.userId)) throw new WikiError("user_id_invalid", 400, "userId");
  await unblockUser(params.userId);
  return json({ ok: true });
});
