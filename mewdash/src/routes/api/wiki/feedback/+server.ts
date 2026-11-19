import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { readBody, requireLocale, wikiEndpoint } from "$lib/server/wiki/http";
import { submitFeedback } from "$lib/server/wiki/store";
import { isRowId, validateFeedback } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = wikiEndpoint("member", true, async ({ request }, access) => {
  const body = await readBody(request);
  if (!isRowId(body.pageId)) throw new WikiError("not_found", 404);
  const locale = requireLocale(body.locale);
  const feedback = validateFeedback(body);
  if (!feedback.ok) throw new WikiError(feedback.error, 400, feedback.field);

  await submitFeedback(body.pageId, locale, feedback.value.helpful, feedback.value.reason, feedback.value.note, access.userId as string);
  return json({ ok: true }, { status: 201 });
});
