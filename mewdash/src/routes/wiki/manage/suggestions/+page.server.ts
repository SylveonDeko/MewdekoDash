import { requireEditor } from "$lib/server/wiki/guard";
import { listSuggestions } from "$lib/server/wiki/store";
import type { SuggestionRecord } from "$lib/wiki/records";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const access = await requireEditor(locals, url);
  const closed = url.searchParams.get("show") === "closed";
  if (!access.databaseAvailable) return { closed, suggestions: [] as SuggestionRecord[] };
  return { closed, suggestions: await listSuggestions(closed ? "closed" : "open", null, 100) };
};
