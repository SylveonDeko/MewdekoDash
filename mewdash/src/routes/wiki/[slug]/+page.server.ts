import { error, redirect } from "@sveltejs/kit";
import { logger } from "$lib/logger";
import { getWikiArticle, getWikiIndex, getWikiPageRef } from "$lib/server/wiki";
import { getAccess } from "$lib/server/wiki/access";
import { isBlocked } from "$lib/server/wiki/blocks";
import { findRedirect } from "$lib/server/wiki/insights";
import { readSettings } from "$lib/server/wiki/settings";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals, url }) => {
  const article = await getWikiArticle(params.slug);
  if (!article) {
    const moved = await findRedirect(params.slug).catch(() => null);
    if (moved) redirect(301, `/wiki/${moved}${url.search}`);
    error(404, `No wiki page for "${params.slug}" yet`);
  }

  const all = await getWikiIndex();
  const related = article.related
    .map((slug) => all.find((a) => a.slug === slug))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  const index = all.findIndex((a) => a.slug === article.slug);
  const previous = index > 0 ? all[index - 1] : null;
  const next = index < all.length - 1 ? all[index + 1] : null;
  const ref = await getWikiPageRef(params.slug);

  let canSuggest = false;
  const access = await getAccess(locals);
  if (access.userId && access.databaseAvailable) {
    try {
      canSuggest = (await readSettings()).suggestionsOpen && !(await isBlocked(access.userId));
    } catch (cause) {
      logger.error("Reading the suggestion settings failed:", cause);
    }
  }

  return { article, related, previous, next, pageId: ref?.pageId ?? null, articleLocale: ref?.locale ?? "en-US", canSuggest };
};
