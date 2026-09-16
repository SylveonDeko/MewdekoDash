// routes/dashboard/process-logs/+page.server.ts
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent }) => {
  const data = await parent();

  if (!data.user) {
    redirect(302, "/");
  }

  return { user: data.user };
};
