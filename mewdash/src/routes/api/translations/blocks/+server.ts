import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { readBody } from "$lib/server/wiki/http";
import { blockUser } from "$lib/server/translations/contributors";
import { translateEndpoint } from "$lib/server/translations/http";
import { knownTranslatorName } from "$lib/server/translations/store";
import { isUserId } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = translateEndpoint("admin", true, async ({ request }, access) => {
  const body = await readBody(request);
  if (!isUserId(body.userId)) throw new WikiError("user_id_invalid", 400, "userId");
  if (body.userId === access.userId) throw new WikiError("bad_request", 400, "userId");
  const name = (await knownTranslatorName(body.userId)) ?? body.userId;
  await blockUser(body.userId, name, access.userId as string);
  return json({ ok: true }, { status: 201 });
});
