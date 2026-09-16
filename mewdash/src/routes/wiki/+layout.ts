import { getWikiIndex } from "$lib/wiki";


export function load() {
  return { all: getWikiIndex() };
}
