import { getOverlay } from "$lib/i18n";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    user: locals.user,
    locale: locals.locale,
    translationOverlay: getOverlay()
  };
};