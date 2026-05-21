import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { requireMobileAuth } from "$lib/server/mobileAuthGuard";
import { listMobileInstances } from "$lib/server/mobileInstances";
import { logger } from "$lib/logger";

/**
 * Lists the bot instances this dashboard knows about. The iOS app calls
 * this after sign-in to populate its instance picker. Per-instance
 * routing is then driven by the `X-Mobile-Instance` header that the proxy
 * validates server-side.
 */
export const GET: RequestHandler = async ({ request }) => {
  const auth = requireMobileAuth(request);
  if ("error" in auth) return auth.error;

  try {
    const instances = await listMobileInstances();
    return json({ instances });
  } catch (err) {
    logger.error("Mobile instance discovery failed", err);
    const message = err instanceof Error ? err.message : "unknown_error";
    return json({ error: message, instances: [] }, { status: 503 });
  }
};
