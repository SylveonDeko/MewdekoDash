import { error, redirect } from "@sveltejs/kit";
import { availableLocales } from "$lib/i18n";
import { getWikiPageRef } from "$lib/server/wiki";
import { getAccess } from "$lib/server/wiki/access";
import { getOpenSuggestion, getVersion } from "$lib/server/wiki/store";
import { sourceLocale } from "$lib/wiki/catalog";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, url, locals }) => {
  const access = await getAccess(locals);
  if (!access.userId) {
    redirect(302, `/api/discord/login?redirect_to=${encodeURIComponent(url.pathname + url.search)}`);
  }

  const ref = await getWikiPageRef(params.slug);
  if (!ref) error(404, `No wiki page for "${params.slug}" yet`);

  const locales = availableLocales();
  const requested = url.searchParams.get("locale");
  const locale = requested && locales.includes(requested) ? requested : ref.locale;

  if (!ref.pageId || !access.databaseAvailable) {
    return { available: false as const, slug: params.slug, locale, locales };
  }

  const [existing, own, source] = await Promise.all([
    getOpenSuggestion(ref.pageId, locale, access.userId),
    getVersion(ref.pageId, locale),
    getVersion(ref.pageId, sourceLocale),
  ]);
  const base = own ?? source;
  const initial = existing ?? base;
  if (!initial) error(404, `No wiki page for "${params.slug}" yet`);

  return {
    available: true as const,
    slug: params.slug,
    pageId: ref.pageId,
    locale,
    locales,
    replacing: existing !== null,
    initial: { title: initial.title, summary: initial.summary, tags: initial.tags, markdown: initial.markdown, note: existing?.note ?? "" },
  };
};
