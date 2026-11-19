import { json } from "@sveltejs/kit";
import { getWikiArticleForPath } from "$lib/server/wiki";
import { wikiEndpoint } from "$lib/server/wiki/http";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = wikiEndpoint("none", false, async ({ url }) => {
  const path = url.searchParams.get("path") ?? "";
  if (!/^\/[A-Za-z0-9/_-]{0,200}$/.test(path)) return json({ article: null });
  const article = await getWikiArticleForPath(path);
  return json({ article: article ?? null });
});
