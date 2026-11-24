import { availableLocales } from "$lib/i18n";
import { requireEditor } from "$lib/server/wiki/guard";
import { listLanguageRows } from "$lib/server/wiki/insights";
import { sourceLocale } from "$lib/wiki/catalog";
import type { LanguageRow } from "$lib/wiki/records";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const access = await requireEditor(locals, url);
  const locales = availableLocales().filter((locale) => locale !== sourceLocale);
  if (!access.databaseAvailable) return { rows: [] as LanguageRow[], locales };
  return { rows: await listLanguageRows(), locales };
};
