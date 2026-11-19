import { requireMember } from "$lib/server/wiki/guard";
import { listSuggestions } from "$lib/server/wiki/store";
import type { SuggestionRecord } from "$lib/wiki/records";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const access = await requireMember(locals, url);
  if (!access.databaseAvailable) return { suggestions: [] as SuggestionRecord[] };
  return { suggestions: await listSuggestions(null, access.userId, 100) };
};
