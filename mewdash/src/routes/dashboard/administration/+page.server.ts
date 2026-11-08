import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { DiscordUser } from "$lib/types/discord.ts";

// @ts-ignore
// More or less because locals can be any type because its just a context thing
export const load: PageServerLoad = ({ locals, url }): { user?: DiscordUser } => {
  if (url.searchParams.get("tab") === "protection") redirect(302, "/dashboard/automod?tab=protection");
  if (!locals.user) return {};
  return { user: locals.user };
};
