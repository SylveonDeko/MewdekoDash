import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { wikiEndpoint } from "$lib/server/wiki/http";
import { getPreviousRevision, getRevision, getVersion } from "$lib/server/wiki/store";
import { isRowId } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = wikiEndpoint("editor", true, async ({ params }) => {
  if (!isRowId(params.id)) throw new WikiError("not_found", 404);
  const revision = await getRevision(params.id);
  if (!revision) throw new WikiError("not_found", 404);
  const [previous, current] = await Promise.all([getPreviousRevision(revision), getVersion(revision.pageId, revision.locale)]);
  return json({ revision, previous, current });
});
