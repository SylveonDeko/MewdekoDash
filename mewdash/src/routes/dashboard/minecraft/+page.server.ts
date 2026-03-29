// routes/dashboard/minecraft/+page.server.ts
import type { PageServerLoad } from "./$types";
import type { DiscordUser } from "$lib/types/discord";

// @ts-ignore
export const load: PageServerLoad = ({ locals }): { user?: DiscordUser } => {
  if (!locals.user) return {};
  return { user: locals.user };
};
