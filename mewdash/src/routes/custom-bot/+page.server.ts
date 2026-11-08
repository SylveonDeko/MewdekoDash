import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.user) {
    redirect(302, `/api/discord/login?redirect_to=${encodeURIComponent(url.pathname + url.search)}`);
  }

  return { user: locals.user };
};
