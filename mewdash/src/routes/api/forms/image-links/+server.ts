import { json } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";
import JSONbig from "json-bigint";
import { canMintBackendToken, mintBackendToken } from "$lib/server/backendJwt";
import { MAX_URL_LENGTH, isDiscordCdn, isFetchable, signImageUrl } from "$lib/server/formImageProxy";
import { apiKeyFor, defaultInstanceURL, resolveInstanceURLByPort } from "$lib/server/instances";
import { collectFormImageUrls, type FormImageSource } from "$lib/utils/formImageUrls";

const MAX_LINKS = 100;

/**
 * Reads one bot API path as the signed in user, so the bot decides whether that person may see the
 * form. A refusal or any failure comes back as null.
 */
async function botGetAs<T>(base: string, path: string, token: string): Promise<T | null> {
  try {
    const response = await fetch(`${base}/${path}`, {
      headers: { "X-API-Key": apiKeyFor(base), Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) return null;
    return JSONbig({ storeAsString: true }).parse(await response.text()) as T;
  } catch {
    return null;
  }
}

/**
 * Gives the page the address each outside picture of a form should load from. The caller names a
 * form and the pictures come from the form the bot returns for that user, never from the caller,
 * so only addresses the form really shows are ever signed. Pictures on Discord's own CDN are
 * loaded as they are, and every other http or https address comes back as a signed address on
 * this site.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) return json({ error: "unauthorized" }, { status: 401 });

  let body: { formId?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad_request" }, { status: 400 });
  }

  const formId = body.formId;
  if (typeof formId !== "number" || !Number.isInteger(formId) || formId < 1 || formId > 2_147_483_647) {
    return json({ error: "bad_request" }, { status: 400 });
  }

  if (!canMintBackendToken()) return json({ error: "backend_auth_unavailable" }, { status: 503 });
  const token = mintBackendToken(locals.user);
  if (!token) return json({ error: "backend_auth_unavailable" }, { status: 503 });

  const portHeader = request.headers.get("x-instance-port");
  let base: string | null;
  if (portHeader) {
    const port = Number.parseInt(portHeader, 10);
    if (!Number.isInteger(port)) return json({ error: "invalid_instance_port" }, { status: 400 });
    base = await resolveInstanceURLByPort(port);
  } else {
    base = await defaultInstanceURL();
  }
  if (!base) return json({ error: "unknown_instance" }, { status: 404 });

  const [form, questions] = await Promise.all([
    botGetAs<{ id: number }>(base, `forms/${formId}`, token),
    botGetAs<FormImageSource[]>(base, `forms/${formId}/questions`, token)
  ]);
  if (!form || !Array.isArray(questions)) return json({ error: "not_found" }, { status: 404 });

  const links: Record<string, string> = {};

  for (const entry of collectFormImageUrls(questions).slice(0, MAX_LINKS)) {
    if (entry.length > MAX_URL_LENGTH) continue;

    let parsed: URL;
    try {
      parsed = new URL(entry);
    } catch {
      continue;
    }

    if (!isFetchable(parsed)) continue;

    if (isDiscordCdn(entry)) {
      links[entry] = entry;
      continue;
    }

    const signed = signImageUrl(entry);
    if (signed) links[entry] = signed;
  }

  return json({ links });
};
