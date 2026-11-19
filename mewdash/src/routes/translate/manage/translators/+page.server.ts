import { requireTranslationAdmin } from "$lib/server/translations/guard";
import { allLocales, listTranslators } from "$lib/server/translations/store";
import type { TranslatorRecord } from "$lib/translate/records";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const access = await requireTranslationAdmin(locals, url);
  if (!access.databaseAvailable) return { translators: [] as TranslatorRecord[], locales: [] as string[] };
  const [translators, locales] = await Promise.all([listTranslators(), allLocales()]);
  return { translators, locales };
};
