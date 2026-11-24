import { getTranslationAccess } from "$lib/server/translations/access";
import { filterParam, pageParam, sortParam } from "$lib/server/translations/http";
import { getOverview, listStrings } from "$lib/server/translations/store";
import type { CatalogOverview, StringPage } from "$lib/translate/records";
import { translationLimits } from "$lib/translate/rules";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const access = await getTranslationAccess(locals);
  const empty = { overview: [] as CatalogOverview[], catalog: null, locale: null, group: null, filter: filterParam(url), sort: sortParam(url), search: "", strings: null as StringPage | null };
  if (!access.databaseAvailable) return empty;

  const overview = await getOverview();
  const catalog = overview.find((c) => c.catalog === url.searchParams.get("catalog")) ?? overview[0];
  if (!catalog) return empty;

  const locale = catalog.languages.find((l) => l.locale === url.searchParams.get("locale"))?.locale ?? catalog.languages[0]?.locale ?? null;
  const requestedGroup = url.searchParams.get("group");
  const group = requestedGroup && catalog.groups.includes(requestedGroup) ? requestedGroup : null;
  const search = (url.searchParams.get("q") ?? "").slice(0, translationLimits.searchMax);
  const filter = filterParam(url);
  const sort = sortParam(url);

  const strings = locale
    ? await listStrings({ catalog: catalog.catalog, locale, group, filter, sort, search, page: pageParam(url) }, access.userId)
    : null;
  return { overview, catalog: catalog.catalog, locale, group, filter, sort, search, strings };
};
