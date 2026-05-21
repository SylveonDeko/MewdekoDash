import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { rotateRefreshToken } from "$lib/server/mobileJwt";

/**
 * Rotates a mobile refresh token. Tokens are single-use and family-tracked:
 * any reuse burns the entire family.
 *
 * Body: `{ refreshToken }`.
 */
export const POST: RequestHandler = async ({ request }) => {
  let body: { refreshToken?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_body" }, { status: 400 });
  }
  if (!body.refreshToken) {
    return json({ error: "missing_refresh_token" }, { status: 400 });
  }

  const result = await rotateRefreshToken(body.refreshToken);
  if ("error" in result) {
    const status = result.error === "invalid" ? 400 : 401;
    return json({ error: result.error }, { status });
  }

  return json({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    expiresIn: result.expiresIn,
  });
};
