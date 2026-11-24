import { requireTranslationReviewer } from "$lib/server/translations/guard";
import { pageParam, statusParam } from "$lib/server/translations/http";
import { getOverview, listQueue } from "$lib/server/translations/store";
import { reviewableLocales } from "$lib/translate/permissions";
import type { QueueStatus, SuggestionPage } from "$lib/translate/records";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const access = await requireTranslationReviewer(locals, url);
  const status = statusParam(url);
  const none = { queue: null as SuggestionPage | null, status: "open" as QueueStatus, catalog: null as string | null, locale: null as string | null, catalogs: [] as string[], locales: [] as string[] };
  if (!access.databaseAvailable) return none;

  const overview = await getOverview();
  const catalogs = overview.map((c) => c.catalog);
  const catalog = catalogs.find((c) => c === url.searchParams.get("catalog")) ?? null;
  const everyLocale = [...new Set(overview.flatMap((c) => c.languages.map((l) => l.locale)))].sort();
  const locales = reviewableLocales(access.scope, everyLocale);
  const locale = locales.find((l) => l === url.searchParams.get("locale")) ?? null;

  const queue = await listQueue(access.scope, { catalog, locale, status }, pageParam(url));
  return { queue, status, catalog, locale, catalogs, locales };
};
