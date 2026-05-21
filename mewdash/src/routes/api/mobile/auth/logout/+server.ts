import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { requireMobileAuth } from "$lib/server/mobileAuthGuard";
import { revokeRefreshToken, revokeSession } from "$lib/server/mobileJwt";

/**
 * Revokes the caller's refresh-token family and underlying mobile session.
 * Requires a Bearer access token. The refresh token, when supplied, ensures
 * the family is identified even if the access token's session has expired.
 *
 * Body: `{ refreshToken? }`.
 */
export const POST: RequestHandler = async (event) => {
  const auth = requireMobileAuth(event.request);
  if ("error" in auth) return auth.error;

  let body: { refreshToken?: string } = {};
  try {
    body = await event.request.json();
  } catch {
    /* empty body is acceptable */
  }

  if (body.refreshToken) await revokeRefreshToken(body.refreshToken);
  await revokeSession(auth.claims.sid);

  return json({ ok: true });
};
