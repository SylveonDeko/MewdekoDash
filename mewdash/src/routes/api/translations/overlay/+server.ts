import { json } from "@sveltejs/kit";
import { overlayFor } from "$lib/server/translations/overlay";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = ({ url }) => {
  const locale = url.searchParams.get("locale") ?? "";
  return json({ entries: locale.length > 0 && locale.length <= 32 ? (overlayFor(locale) ?? {}) : {} });
};
