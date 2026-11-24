import { error } from "@sveltejs/kit";
import { readImage } from "$lib/server/wiki/uploads";
import { parseUploadFile } from "$lib/wiki/images";
import type { RequestHandler } from "./$types";

/** Serves an image uploaded in the wiki editor. Public, since the images sit in public articles. */
export const GET: RequestHandler = async ({ params }) => {
  const named = parseUploadFile(params.file);
  if (!named) error(404, "Not found");

  let image;
  try {
    image = await readImage(named.id);
  } catch {
    error(503, "Images are unavailable");
  }
  if (!image || image.type !== named.type) error(404, "Not found");

  return new Response(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.type,
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
