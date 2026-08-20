import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { requireMobileAuth } from "$lib/server/mobileAuthGuard";
import { filterInstancesForUser, listMobileInstances } from "$lib/server/instances";
import { logger } from "$lib/logger";

/**
 * Lists the bot instances the signed-in user can administer.
 *
 * Instances the user shares no administered guild with are withheld, so the
 * picker never offers a deployment that would show an empty server list.
 *
 * @returns `{ instances }`, ordered as registered.
 */
export const GET: RequestHandler = async ({ request }) => {
  const auth = requireMobileAuth(request);
  if ("error" in auth) return auth.error;

  try {
    const all = await listMobileInstances();
    const instances = await filterInstancesForUser(all, auth.claims.sub);
    return json({ instances });
  } catch (err) {
    logger.error("Mobile instance discovery failed", err);
    const message = err instanceof Error ? err.message : "unknown_error";
    return json({ error: message, instances: [] }, { status: 503 });
  }
};
