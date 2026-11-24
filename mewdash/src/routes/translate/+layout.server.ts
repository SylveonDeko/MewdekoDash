import { isBlocked } from "$lib/server/translations/contributors";
import { getTranslationAccess } from "$lib/server/translations/access";
import { getSettings } from "$lib/server/translations/settings";
import { isReviewer } from "$lib/translate/permissions";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  const access = await getTranslationAccess(locals);
  let blocked = false;
  let suggestionsOpen = true;
  if (access.databaseAvailable) {
    suggestionsOpen = (await getSettings()).suggestionsOpen;
    if (access.userId) blocked = await isBlocked(access.userId);
  }
  return {
    tr: {
      signedIn: access.userId !== null,
      isAdmin: access.isAdmin,
      isReviewer: isReviewer(access.scope),
      scope: access.scope,
      databaseAvailable: access.databaseAvailable,
      blocked,
      suggestionsOpen,
    },
  };
};
