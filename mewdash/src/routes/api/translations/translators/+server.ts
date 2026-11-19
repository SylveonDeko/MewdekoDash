import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { readBody } from "$lib/server/wiki/http";
import { translateEndpoint } from "$lib/server/translations/http";
import { addTranslator, knownTranslatorName, listTranslators } from "$lib/server/translations/store";
import { translationLimits } from "$lib/translate/rules";
import { collapseWhitespace, isUserId } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = translateEndpoint("admin", true, async () => {
  return json({ translators: await listTranslators() });
});

export const POST: RequestHandler = translateEndpoint("admin", true, async ({ request }, access) => {
  const body = await readBody(request);
  if (!isUserId(body.userId)) throw new WikiError("user_id_invalid", 400, "userId");
  if (typeof body.locale !== "string") throw new WikiError("locale_invalid", 400, "locale");

  let name = typeof body.name === "string" ? collapseWhitespace(body.name) : "";
  if ([...name].length > translationLimits.nameMax) throw new WikiError("name_too_long", 400, "name");
  if (!name) name = (await knownTranslatorName(body.userId)) ?? (body.userId === access.userId ? access.name : body.userId);

  await addTranslator(body.userId, body.locale, name, access.userId as string);
  return json({ ok: true, name }, { status: 201 });
});
