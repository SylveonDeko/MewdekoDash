import { error } from "@sveltejs/kit";
import { getWikiArticle, getWikiIndex, getWikiPageRef } from "$lib/server/wiki";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const article = await getWikiArticle(params.slug);
  if (!article) {
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

  return { article, related, previous, next, pageId: ref?.pageId ?? null, articleLocale: ref?.locale ?? "en-US" };
};
