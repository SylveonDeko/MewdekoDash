import type { PageServerLoad } from "./$types";
import type { DiscordUser } from "$lib/types/discord";

/** Passes the signed in user through for the message previews. */
export const load: PageServerLoad = ({ locals }): { user?: DiscordUser } => {
  if (!locals.user) return {};
  return { user: locals.user };
};
