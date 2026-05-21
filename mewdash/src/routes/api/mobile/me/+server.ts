import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { requireMobileAuth } from "$lib/server/mobileAuthGuard";
import { getSession } from "$lib/server/mobileJwt";

/**
 * Returns the authenticated user's profile as known to the dashboard.
 * Requires a Bearer access token.
 */
export const GET: RequestHandler = async ({ request }) => {
  const auth = requireMobileAuth(request);
  if ("error" in auth) return auth.error;

  const session = await getSession(auth.claims.sid);
  if (!session) {
    return json({ error: "session_revoked" }, { status: 401 });
  }

  return json({
    user: {
      id: session.user.id.toString(),
      username: session.user.username,
      globalName: session.user.display_name ?? session.user.username,
      avatar: session.user.avatar,
    },
  });
};
