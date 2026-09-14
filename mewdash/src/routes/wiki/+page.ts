import { getWikiCategories, getWikiIndex } from "$lib/wiki";


export function load() {
  return {
    articles: getWikiIndex(),
    categories: getWikiCategories(),
  };
}
