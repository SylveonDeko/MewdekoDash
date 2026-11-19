import { error } from "@sveltejs/kit";
import { availableLocales } from "$lib/i18n";
import { requireEditor } from "$lib/server/wiki/guard";
import { getManagePage, getVersion, listCategories, listManagePages, listVersionLocales } from "$lib/server/wiki/store";
import { sourceLocale } from "$lib/wiki/catalog";
import { isRowId } from "$lib/wiki/validation";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, url, locals }) => {
  const access = await requireEditor(locals, url);
  if (!access.databaseAvailable) return { page: null };
  if (!isRowId(params.id)) error(404);

  const page = await getManagePage(params.id);
  if (!page) error(404);

  const locales = availableLocales();
  const requested = url.searchParams.get("locale");
  const locale = requested && locales.includes(requested) ? requested : sourceLocale;

  const [version, source, translated, categories, pages] = await Promise.all([
    getVersion(page.id, locale),
    locale === sourceLocale ? Promise.resolve(null) : getVersion(page.id, sourceLocale),
    listVersionLocales(page.id),
    listCategories(),
    listManagePages(),
  ]);

  const requestedTab = url.searchParams.get("tab");
  const tab: "article" | "details" | "history" = requestedTab === "history" || requestedTab === "details" ? requestedTab : "article";

  return {
    page,
    tab,
    locale,
    locales,
    translated,
    version,
    prefill: version ?? source,
    categories,
    choices: pages.map((p) => ({ slug: p.slug, title: p.title })),
  };
};
