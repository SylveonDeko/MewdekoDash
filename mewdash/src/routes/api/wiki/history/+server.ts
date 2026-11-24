import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { listPublicRevisions } from "$lib/server/wiki/history";
import { requireLocale, wikiEndpoint } from "$lib/server/wiki/http";
import { isRowId } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

const pageSize = 30;

export const GET: RequestHandler = wikiEndpoint("none", true, async ({ url }) => {
  const pageId = url.searchParams.get("pageId");
  if (!isRowId(pageId)) throw new WikiError("not_found", 404);
  const locale = requireLocale(url.searchParams.get("locale"));
  const before = url.searchParams.get("before");
  if (before !== null && !isRowId(before)) throw new WikiError("bad_request", 400, "before");

  const rows = await listPublicRevisions(pageId, locale, before, pageSize + 1);
  return json({ revisions: rows.slice(0, pageSize), hasMore: rows.length > pageSize });
});
