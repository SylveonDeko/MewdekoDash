import { requireTranslationAdmin } from "$lib/server/translations/guard";
import { allLocales, getOverview } from "$lib/server/translations/store";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const access = await requireTranslationAdmin(locals, url);
  if (!access.databaseAvailable) return { catalogs: [] as string[], locales: [] as string[] };
  const [overview, locales] = await Promise.all([getOverview(), allLocales()]);
  return { catalogs: overview.map((c) => c.catalog), locales };
};
