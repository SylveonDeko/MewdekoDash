import { requireTranslationAdmin } from "$lib/server/translations/guard";
import { getSettings } from "$lib/server/translations/settings";
import type { TranslationSettings } from "$lib/translate/records";
import { translationLimits } from "$lib/translate/rules";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const access = await requireTranslationAdmin(locals, url);
  const settings: TranslationSettings = access.databaseAvailable
    ? await getSettings()
    : { suggestionsOpen: true, openSuggestionsMax: translationLimits.openSuggestionsMax };
  return { settings };
};
