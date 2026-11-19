import { getWikiIndex } from "$lib/server/wiki";
import type { PageServerLoad } from "./$types";

/** Hand-picked entry points for people who have not decided what to read yet. */
const startHere = ["moderation", "multigreets", "xp", "permissions", "tickets", "chat-triggers", "starboard", "suggestions"];

export const load: PageServerLoad = async () => {
  const articles = await getWikiIndex();
  return {
    articles,
    featured: startHere.map((slug) => articles.find((a) => a.slug === slug)).filter((a) => a !== undefined),
  };
};
