import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

/**
 * The owner area needs a signed in user before anything renders. Whether that user is a bot
 * owner is decided by the bot itself: every owner endpoint checks the dashboard JWT server side,
 * and the layout bounces non-owners back to the dashboard once the ownership probe answers.
 */
export const load: LayoutServerLoad = async ({ locals, url }) => {
  const user = locals.user || null;
  if (!user) {
    const target = encodeURIComponent(url.pathname + url.search);
    redirect(302, `/api/discord/login?redirect_to=${target}`);
  }

  return { user };
};
