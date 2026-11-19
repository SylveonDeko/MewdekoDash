import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { actorOf, readBody, wikiEndpoint } from "$lib/server/wiki/http";
import { undoToRevision } from "$lib/server/wiki/store";
import { isRowId, optionalText, wikiLimits } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = wikiEndpoint("editor", true, async ({ request, params }, access) => {
  if (!isRowId(params.id)) throw new WikiError("not_found", 404);
  const body = await readBody(request);
  if (!isRowId(body.revisionId)) throw new WikiError("bad_request", 400, "revisionId");
  const expected = body.expectedRevisionId;
  if (expected !== null && !isRowId(expected)) throw new WikiError("bad_request", 400, "expectedRevisionId");
  const note = optionalText(body.note, wikiLimits.noteMax, "note_too_long");
  if (!note.ok) throw new WikiError(note.error, 400, "note");

  const revisionId = await undoToRevision(params.id, body.revisionId, note.value, actorOf(access), expected);
  return json({ revisionId });
});
