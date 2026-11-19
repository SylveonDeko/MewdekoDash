import { requireTranslationMember } from "$lib/server/translations/guard";
import { pageParam } from "$lib/server/translations/http";
import { listMySuggestions } from "$lib/server/translations/store";
import type { SuggestionPage } from "$lib/translate/records";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const access = await requireTranslationMember(locals, url);
  if (!access.databaseAvailable) return { suggestions: null as SuggestionPage | null };
  return { suggestions: await listMySuggestions(access.userId as string, pageParam(url)) };
};
