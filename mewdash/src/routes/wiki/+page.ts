import { getWikiIndex } from "$lib/wiki";

/** Hand-picked entry points for people who have not decided what to read yet. */
const startHere = ["moderation", "multigreets", "xp", "permissions", "tickets", "chat-triggers", "starboard", "suggestions"];

export function load() {
  const articles = getWikiIndex();
  return {
    articles,
    featured: startHere.map((slug) => articles.find((a) => a.slug === slug)).filter((a) => a !== undefined),
  };
}
