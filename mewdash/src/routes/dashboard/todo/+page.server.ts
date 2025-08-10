// routes/dashboard/todo/+page.server.ts
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  // Check if user is authenticated
  if (!locals.user) {
    throw redirect(302, `/api/discord/login?redirect_to=${encodeURIComponent(url.pathname + url.search)}`);
  }

  // The page will handle data loading client-side since it requires
  // guild selection and real-time updates
  return {
    user: locals.user
  };
};