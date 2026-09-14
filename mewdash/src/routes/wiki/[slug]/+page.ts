import { error } from "@sveltejs/kit";
import { getWikiArticle, getWikiIndex } from "$lib/wiki";


export function entries() {
  return getWikiIndex().map((a) => ({ slug: a.slug }));
}

export function load({ params }) {
  const article = getWikiArticle(params.slug);
  if (!article) {
    error(404, `No wiki page for "${params.slug}" yet`);
  }

  const all = getWikiIndex();
  const related = article.related
    .map((slug) => all.find((a) => a.slug === slug))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  const index = all.findIndex((a) => a.slug === article.slug);
  const previous = index > 0 ? all[index - 1] : null;
  const next = index < all.length - 1 ? all[index + 1] : null;

  return { article, related, previous, next, all };
}
