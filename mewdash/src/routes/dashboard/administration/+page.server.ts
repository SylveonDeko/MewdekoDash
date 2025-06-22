// routes/dashboard/administration/+page.server.ts
import type { PageServerLoad } from "./$types";
import type { DiscordUser } from "$lib/types/discord";

// @ts-ignore
// More or less because locals can be any type because its just a context thing
export const load: PageServerLoad = ({ locals }): { user?: DiscordUser } => {
  if (!locals.user) return {};
  return { user: locals.user };
};