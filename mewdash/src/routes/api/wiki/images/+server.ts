import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { wikiEndpoint } from "$lib/server/wiki/http";
import { takeUse } from "$lib/server/wiki/limits";
import { storeImage } from "$lib/server/wiki/uploads";
import { sniffImage } from "$lib/wiki/images";
import { wikiLimits } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

const uploadsPerHour = 60;
const hourMs = 60 * 60 * 1000;
const envelopeBytes = 64 * 1024;

export const POST: RequestHandler = wikiEndpoint("editor", true, async ({ request }, access) => {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > wikiLimits.imageMax + envelopeBytes) throw new WikiError("image_too_large", 413);
  if (!takeUse("upload", access.userId as string, uploadsPerHour, hourMs)) throw new WikiError("rate_limited", 429);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    throw new WikiError("bad_request");
  }
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) throw new WikiError("image_invalid", 400, "file");
  if (file.size > wikiLimits.imageMax) throw new WikiError("image_too_large", 413, "file");

  const data = Buffer.from(await file.arrayBuffer());
  const type = sniffImage(data);
  if (!type) throw new WikiError("image_invalid", 400, "file");

  const url = await storeImage(data, type, { id: access.userId as string, name: access.name });
  return json({ url }, { status: 201 });
});
