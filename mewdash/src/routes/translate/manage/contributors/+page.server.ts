import { listContributors } from "$lib/server/translations/contributors";
import { requireTranslationAdmin } from "$lib/server/translations/guard";
import { pageParam } from "$lib/server/translations/http";
import { allLocales } from "$lib/server/translations/store";
import type { ContributorPage } from "$lib/translate/records";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const access = await requireTranslationAdmin(locals, url);
  if (!access.databaseAvailable) return { contributors: null as ContributorPage | null, locales: [] as string[], locale: null as string | null };
  const locales = await allLocales();
  const requested = url.searchParams.get("locale");
  const locale = locales.find((l) => l === requested) ?? null;
  return { contributors: await listContributors(locale, pageParam(url)), locales, locale };
};
