import type { RequestHandler } from "@sveltejs/kit";
import { acquireSlot, fetchImage, proxyAvailable, verifyImageUrl } from "$lib/server/formImageProxy";

/**
 * Serves outside pictures shown on forms, so a visitor's browser only ever talks to this site. An
 * address is only fetched when it carries a signature this site made, and everything that is refused
 * or fails answers an empty 404.
 */
function missing(): Response {
  return new Response(null, { status: 404 });
}

export const GET: RequestHandler = async ({ url, getClientAddress }) => {
  if (!proxyAvailable()) return missing();

  const original = verifyImageUrl(url.searchParams.get("u"), url.searchParams.get("s"));
  if (!original) return missing();

  let visitor: string;
  try {
    visitor = getClientAddress();
  } catch {
    visitor = "unknown";
  }

  const release = acquireSlot(visitor);
  if (!release) return new Response(null, { status: 429 });

  try {
    const image = await fetchImage(original);
    if (!image) return missing();

    return new Response(new Uint8Array(image.content), {
      headers: {
        "Content-Type": image.contentType,
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=86400, immutable",
        "Cross-Origin-Resource-Policy": "same-origin"
      }
    });
  } finally {
    release();
  }
};
