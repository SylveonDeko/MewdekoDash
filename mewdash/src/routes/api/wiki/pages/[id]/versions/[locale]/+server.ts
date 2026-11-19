import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { actorOf, readBody, requireLocale, wikiEndpoint } from "$lib/server/wiki/http";
import { getStartingTags, saveVersion } from "$lib/server/wiki/store";
import { isRowId, validateArticle } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

export const PUT: RequestHandler = wikiEndpoint("editor", true, async ({ request, params }, access) => {
  if (!isRowId(params.id)) throw new WikiError("not_found", 404);
  const locale = requireLocale(params.locale);
  const body = await readBody(request);
  const article = validateArticle(body, await getStartingTags(params.id, locale));
  if (!article.ok) throw new WikiError(article.error, 400, article.field);

  const base = body.baseRevisionId;
  if (base !== null && !isRowId(base)) throw new WikiError("bad_request", 400, "baseRevisionId");

  const { note, ...fields } = article.value;
  const revisionId = await saveVersion(params.id, locale, fields, note, actorOf(access), base);
  return json({ revisionId });
});
