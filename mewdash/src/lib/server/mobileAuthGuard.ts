import { json } from "@sveltejs/kit";
import { verifyAccessToken, type AccessClaims } from "./mobileJwt";

/**
 * Result of a mobile-auth guard check: either resolved claims or a
 * pre-built error response the caller should return verbatim.
 */
export type MobileAuthResult =
  | { claims: AccessClaims }
  | { error: Response };

/**
 * Validates an `Authorization: Bearer <jwt>` header against the mobile-issued
 * access tokens. On success returns the decoded claims; on failure returns a
 * ready-to-return JSON error response.
 */
export function requireMobileAuth(request: Request): MobileAuthResult {
  const header = request.headers.get("authorization");
  if (!header || !header.toLowerCase().startsWith("bearer ")) {
    return { error: json({ error: "missing_bearer" }, { status: 401 }) };
  }
  const token = header.slice("bearer ".length).trim();
  const claims = verifyAccessToken(token);
  if (!claims) {
    return { error: json({ error: "invalid_token" }, { status: 401 }) };
  }
  return { claims };
}
