import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { actorOf, readBody, requireLocale, wikiEndpoint } from "$lib/server/wiki/http";
import { getStartingTags, submitSuggestion } from "$lib/server/wiki/store";
import { isRowId, validateArticle } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = wikiEndpoint("member", true, async ({ request }, access) => {
  const body = await readBody(request);
  if (!isRowId(body.pageId)) throw new WikiError("not_found", 404);
  const locale = requireLocale(body.locale);
  const article = validateArticle(body, await getStartingTags(body.pageId, locale));
  if (!article.ok) throw new WikiError(article.error, 400, article.field);

  const { note, ...fields } = article.value;
  const id = await submitSuggestion(body.pageId, locale, fields, note, actorOf(access));
  return json({ id }, { status: 201 });
});
