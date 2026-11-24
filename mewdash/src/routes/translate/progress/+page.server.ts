import { getTranslationAccess } from "$lib/server/translations/access";
import { getOverview } from "$lib/server/translations/store";
import type { CatalogOverview } from "$lib/translate/records";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const access = await getTranslationAccess(locals);
  if (!access.databaseAvailable) return { overview: [] as CatalogOverview[] };
  return { overview: await getOverview() };
};
