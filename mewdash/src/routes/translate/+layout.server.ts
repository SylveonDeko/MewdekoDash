import { getTranslationAccess } from "$lib/server/translations/access";
import { isReviewer } from "$lib/translate/permissions";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  const access = await getTranslationAccess(locals);
  return {
    tr: {
      signedIn: access.userId !== null,
      isAdmin: access.isAdmin,
      isReviewer: isReviewer(access.scope),
      scope: access.scope,
      databaseAvailable: access.databaseAvailable,
    },
  };
};
