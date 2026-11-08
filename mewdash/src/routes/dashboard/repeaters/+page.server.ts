// routes/dashboard/repeaters/+page.server.ts
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = () => {
  redirect(308, "/dashboard/channel-messages?tab=repeaters");
};
