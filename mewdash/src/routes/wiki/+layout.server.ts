import { getAccess } from "$lib/server/wiki/access";
import { getWikiIndex } from "$lib/server/wiki";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  const access = await getAccess(locals);
  return {
    all: await getWikiIndex(),
    wikiAccess: {
      signedIn: access.userId !== null,
      canEdit: access.canEdit,
      canManageEditors: access.canManageEditors,
      databaseAvailable: access.databaseAvailable,
    },
  };
};
