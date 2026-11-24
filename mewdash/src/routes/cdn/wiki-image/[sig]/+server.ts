import { error } from "@sveltejs/kit";
import { fetchExternalImage, ProxyError, signatureMatches } from "$lib/server/wiki/imageProxy";
import { addressOf, takeUse } from "$lib/server/wiki/limits";
import { externalImageUrl } from "$lib/wiki/images";
import type { RequestHandler } from "./$types";

const requestsPerMinute = 120;

/** Shows an image from another site on the reader's behalf, for addresses this site signed when it rendered the article. */
export const GET: RequestHandler = async (event) => {
  const target = externalImageUrl(event.url.searchParams.get("u") ?? "");
  if (!target || !/^[0-9a-f]{32}$/.test(event.params.sig) || !signatureMatches(target, event.params.sig)) error(404, "Not found");
  if (!takeUse("image-proxy", addressOf(event), requestsPerMinute, 60_000)) error(429, "Too many requests");

  try {
    const image = await fetchExternalImage(target);
    return new Response(new Uint8Array(image.data), {
      headers: {
        "Content-Type": image.type,
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (cause) {
    if (cause instanceof ProxyError) error(cause.status, cause.message);
    error(502, "The image could not be loaded");
  }
};
