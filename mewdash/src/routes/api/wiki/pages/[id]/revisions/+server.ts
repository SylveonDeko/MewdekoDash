import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { requireLocale, wikiEndpoint } from "$lib/server/wiki/http";
import { listRevisions } from "$lib/server/wiki/store";
import { isRowId } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

const pageSize = 30;

export const GET: RequestHandler = wikiEndpoint("editor", true, async ({ params, url }) => {
  if (!isRowId(params.id)) throw new WikiError("not_found", 404);
  const locale = requireLocale(url.searchParams.get("locale"));
  const before = url.searchParams.get("before");
  if (before !== null && !isRowId(before)) throw new WikiError("bad_request", 400, "before");

  const rows = await listRevisions(params.id, locale, before, pageSize + 1);
  return json({ revisions: rows.slice(0, pageSize), hasMore: rows.length > pageSize });
});
