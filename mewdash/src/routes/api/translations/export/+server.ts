import { exportStrings } from "$lib/server/translations/transfer";
import { formatParam, requiredParam, scopeParam, translateEndpoint } from "$lib/server/translations/http";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = translateEndpoint("admin", true, async ({ url }) => {
  const file = await exportStrings(requiredParam(url, "catalog", 32), requiredParam(url, "locale", 32), formatParam(url), scopeParam(url));
  return new Response(file.body as BodyInit, {
    headers: {
      "Content-Type": file.type,
      "Content-Disposition": `attachment; filename="${file.name}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
